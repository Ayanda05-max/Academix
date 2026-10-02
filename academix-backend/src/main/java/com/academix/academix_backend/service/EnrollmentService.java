package com.academix.academix_backend.service;

import com.academix.academix_backend.model.Course;
import com.academix.academix_backend.model.CourseStatus;
import com.academix.academix_backend.model.Enrollment;
import com.academix.academix_backend.model.EnrollmentStatus;
import com.academix.academix_backend.repository.EnrollmentRepository;
import com.academix.academix_backend.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EnrollmentService {
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;

    @Autowired
    public EnrollmentService(EnrollmentRepository enrollmentRepository, CourseRepository courseRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.courseRepository = courseRepository;
    }

    public Enrollment enrollStudent(Long studentId, Long courseId) {
        enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId).ifPresent(e -> {
            throw new RuntimeException("Student is already enrolled");
        });
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        if (course.getStatus() != CourseStatus.PUBLISHED) {
            throw new RuntimeException("Cannot enroll in a course that is not published");
        }
        Enrollment enrollment = Enrollment.builder()
                .studentId(studentId)
                .courseId(courseId)
                .status(EnrollmentStatus.ACTIVE)
                .build();
        Enrollment saved = enrollmentRepository.save(enrollment);
        return saved;
    }

    public void unenrollStudent(Long studentId, Long courseId) {
        Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        enrollmentRepository.delete(enrollment);
    }

    public List<Enrollment> getEnrollmentsByStudent(Long studentId) {
        return enrollmentRepository.findByStudentId(studentId);
    }

    public List<Enrollment> getEnrollmentsByCourse(Long courseId) {
        return enrollmentRepository.findByCourseId(courseId);
    }
}


