package com.academix.academix_backend.service;

import com.academix.academix_backend.dto.EnrollmentResponse;
import com.academix.academix_backend.model.Course;
import com.academix.academix_backend.model.CourseStatus;
import com.academix.academix_backend.model.Enrollment;
import com.academix.academix_backend.model.EnrollmentStatus;
import com.academix.academix_backend.model.User;
import com.academix.academix_backend.repository.CourseRepository;
import com.academix.academix_backend.repository.EnrollmentRepository;
import com.academix.academix_backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class EnrollmentService {

    private static final Logger log = LoggerFactory.getLogger(EnrollmentService.class);

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Autowired
    public EnrollmentService(EnrollmentRepository enrollmentRepository,
                             CourseRepository courseRepository,
                             UserRepository userRepository,
                             NotificationService notificationService) {
        this.enrollmentRepository = enrollmentRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public Enrollment enrollStudent(Long studentId, Long courseId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Student not found with id: " + studentId));
        if (!"STUDENT".equals(student.getRole())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "User " + studentId + " is not a student");
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Course not found with id: " + courseId));
        if (course.getStatus() != CourseStatus.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot enroll in a course that is not published");
        }

        if (enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Student is already enrolled in this course");
        }

        Enrollment enrollment = Enrollment.builder()
                .studentId(studentId)
                .courseId(courseId)
                .status(EnrollmentStatus.ACTIVE)
                .build();
        Enrollment saved = enrollmentRepository.save(enrollment);

        try {
            notificationService.notifyEnrollment(studentId, courseId);
        } catch (Exception e) {
            log.warn("Enrollment saved but notification failed: {}", e.getMessage());
        }
        return saved;
    }

    public void unenrollStudent(Long studentId, Long courseId) {
        Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Enrollment not found"));
        enrollmentRepository.delete(enrollment);
    }

   
    public List<Enrollment> getEnrollmentsByStudent(Long studentId, String email, boolean isAdmin) {
        if (!isAdmin) {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
            if (!user.getId().equals(studentId)) {
                throw new AccessDeniedException("You can only view your own enrollments");
            }
        }
        return enrollmentRepository.findByStudentId(studentId);
    }

    
    public List<Enrollment> getEnrollmentsByCourse(Long courseId, String email, boolean isAdmin) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Course not found with id: " + courseId));
        if (!isAdmin) {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
            if (!user.getId().equals(course.getInstructorId())) {
                throw new AccessDeniedException("You can only view enrollments of your own courses");
            }
        }
        return enrollmentRepository.findByCourseId(courseId);
    }

   

    public List<EnrollmentResponse> getEnrollmentResponsesByStudent(Long studentId, String email, boolean isAdmin) {
        return getEnrollmentsByStudent(studentId, email, isAdmin).stream()
                .map(this::toResponse).toList();
    }

    public List<EnrollmentResponse> getEnrollmentResponsesByCourse(Long courseId, String email, boolean isAdmin) {
        return getEnrollmentsByCourse(courseId, email, isAdmin).stream()
                .map(this::toResponse).toList();
    }

    private EnrollmentResponse toResponse(Enrollment e) {
        User student = userRepository.findById(e.getStudentId()).orElse(null);
        Course course = courseRepository.findById(e.getCourseId()).orElse(null);
        return new EnrollmentResponse(
                e.getId(),
                e.getStudentId(),
                student == null ? null : student.getFirstName() + " " + student.getLastName(),
                student == null ? null : student.getEmail(),
                e.getCourseId(),
                course == null ? null : course.getTitle(),
                e.getEnrolledAt(),
                e.getStatus() == null ? null : e.getStatus().name());
    }
}