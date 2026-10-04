package com.academix.academix_backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.academix.academix_backend.dto.NotificationResponse;
import com.academix.academix_backend.model.Assignment;
import com.academix.academix_backend.model.Enrollment;
import com.academix.academix_backend.model.EnrollmentStatus;
import com.academix.academix_backend.model.Notification;
import com.academix.academix_backend.model.User;
import com.academix.academix_backend.repository.AssignmentRepository;
import com.academix.academix_backend.repository.EnrollmentRepository;
import com.academix.academix_backend.repository.NotificationRepository;
import com.academix.academix_backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;
    private final EnrollmentRepository enrollmentRepository;
    private final AssignmentRepository assignmentRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository,
                               JavaMailSender mailSender,
                               EnrollmentRepository enrollmentRepository,
                               AssignmentRepository assignmentRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.mailSender = mailSender;
        this.enrollmentRepository = enrollmentRepository;
        this.assignmentRepository = assignmentRepository;
    }

    @Transactional
    public void notifyGradeReleased(Long studentId, Long courseId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        String message = "Your grade for course " + courseId + " has been released.";
        createAndSend(student, message, "GRADE_RELEASED");
    }

    @Transactional
    public void notifyEnrollment(Long studentId, Long courseId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        String message = "You have successfully enrolled in course " + courseId + ".";
        createAndSend(student, message, "ENROLLMENT");
    }

    @Transactional
    public void notifyNewAssignment(Long courseId, String assignmentTitle) {
        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);
        String message = "A new assignment \"" + assignmentTitle + "\" has been posted for course " + courseId + ".";
        for (Enrollment enrollment : enrollments) {
            if (enrollment.getStatus() != EnrollmentStatus.ACTIVE) {
                continue;
            }
            userRepository.findById(enrollment.getStudentId())
                    .ifPresent(student -> createAndSend(student, message, "NEW_ASSIGNMENT"));
        }
    }

    @Transactional
    @Scheduled(cron = "0 0 8 * * *")
    public void notifyDeadlineReminder() {
        LocalDateTime now = LocalDateTime.now();
        List<Assignment> dueSoon = assignmentRepository.findByDueDateBetween(now, now.plusDays(1));
        for (Assignment assignment : dueSoon) {
            List<Enrollment> enrollments = enrollmentRepository.findByCourseId(assignment.getCourseId().getId());
            String message = "Reminder: \"" + assignment.getTitle() + "\" is due soon.";
            for (Enrollment enrollment : enrollments) {
                if (enrollment.getStatus() != EnrollmentStatus.ACTIVE) {
                    continue;
                }
                userRepository.findById(enrollment.getStudentId())
                        .ifPresent(student -> createAndSend(student, message, "DEADLINE_REMINDER"));
            }
        }
    }

    public List<NotificationResponse> getNotificationsForUser(String email) {
        User caller = findCaller(email);
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(caller.getId());
        List<NotificationResponse> responses = new ArrayList<>();
        for (Notification notification : notifications) {
            responses.add(mapToResponse(notification));
        }
        return responses;
    }

    @Transactional
    public NotificationResponse markAsRead(Long id, String email) {
        User caller = findCaller(email);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        if (!notification.getUserId().equals(caller.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your notification");
        }
        notification.setRead(true);
        return mapToResponse(notificationRepository.save(notification));
    }

    private User findCaller(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private NotificationResponse mapToResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setMessage(notification.getMessage());
        response.setType(notification.getType());
        response.setRead(notification.isRead());
        response.setCreatedAt(notification.getCreatedAt());
        return response;
    }

    private void createAndSend(User user, String message, String type) {
        Notification notification = new Notification();
        notification.setUserId(user.getId());
        notification.setMessage(message);
        notification.setType(type);
        notificationRepository.save(notification);

        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(user.getEmail());
            mailMessage.setSubject("Academix Notification");
            mailMessage.setText(message);
            mailSender.send(mailMessage);
        } catch (MailException e) {
            log.error("Failed to send email to {}: {}", user.getEmail(), e.getMessage());
        }
    }
}