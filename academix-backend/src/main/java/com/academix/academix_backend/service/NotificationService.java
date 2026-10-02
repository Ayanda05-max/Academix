package com.academix.academix_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;

import com.academix.academix_backend.repository.NotificationRepository;
import com.academix.academix_backend.repository.UserRepository;
import com.academix.academix_backend.repository.EnrollmentRepository;
import com.academix.academix_backend.repository.AssignmentRepository;
import com.academix.academix_backend.model.Notification;
import com.academix.academix_backend.model.User;
import com.academix.academix_backend.model.Enrollment;
import com.academix.academix_backend.model.Assignment;
import com.academix.academix_backend.dto.NotificationResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Service 
public class NotificationService {
     
     @Autowired 
     private NotificationRepository notificationRepository;

     @Autowired 
     private UserRepository userRepository;

     @Autowired 
     private JavaMailSender mailSender;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;


     @Transactional
     public void notifyGradeReleased(Long studentId, Long courseId){
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("User not found!"));

                String message = "Your grade for course " + courseId + " has been released.";

                createAndSend(student, message, "GRADE_RELEASED");
     }

     @Transactional 
     public void notifyEnrollment(Long studentId, Long courseId){
       User student = userRepository.findById(studentId)
           .orElseThrow(() -> new RuntimeException("User not found"));

           String message = "You have successfully enrolled in course " + courseId + ".";

           createAndSend(student, message, "ENROLLMENT");
     }

     @Transactional
     public void notifyNewAssignment(Long courseId, String assignmentTitle){
         List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);

        String message = "A new assignment \"" + assignmentTitle + "\" has been posted for course " + courseId + ".";

        for (Enrollment enrollment : enrollments) {
            User student = userRepository.findById(enrollment.getStudentId())
                    .orElseThrow(() -> new RuntimeException("User not found!"));
            createAndSend(student, message, "NEW_ASSIGNMENT");
        }
    }
    @Transactional
    @Scheduled(cron = "0 0 8 * * *")
    public void notifyDeadlineReminder() {

        LocalDateTime tomorrow = LocalDateTime.now().plusDays(1);

        List<Assignment> dueSoon = assignmentRepository.findByDueDateBetween(
                LocalDateTime.now(), tomorrow);

        for (Assignment assignment : dueSoon) {
           List<Enrollment> enrollments = enrollmentRepository.findByCourseId(assignment.getCourseId().getId());

            String message = "Reminder: \"" + assignment.getTitle() + "\" is due soon.";

            for (Enrollment enrollment : enrollments) {
                User student = userRepository.findById(enrollment.getStudentId())
                        .orElseThrow(() -> new RuntimeException("User not found!"));
                createAndSend(student, message, "DEADLINE_REMINDER");
            }
        }
    }
    public List<NotificationResponse> getNotificationsForUser(Long userId) {
    List<Notification> notifications = notificationRepository.findByUserId(userId);
    List<NotificationResponse> responses = new ArrayList<>();
    for (Notification notification : notifications) {
        responses.add(mapToResponse(notification));
    }
    return responses;
}

@Transactional
public NotificationResponse markAsRead(Long id) {
    Notification notification = notificationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Notification not found!"));

    notification.setRead(true);
    Notification updated = notificationRepository.save(notification);

    return mapToResponse(updated);
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

     private void createAndSend(User user, String message, String type){
        Notification notification = new Notification();
        notification.setUserId(user.getId());
        notification.setMessage(message);
        notification.setType(type);
        notificationRepository.save(notification);

        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(user.getEmail());
        mailMessage.setSubject("Academix Notification");
        mailMessage.setText(message);
        mailSender.send(mailMessage);

     }


}
