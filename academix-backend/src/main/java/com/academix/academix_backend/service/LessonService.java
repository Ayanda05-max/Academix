package com.academix.academix_backend.service;

import com.academix.academix_backend.model.Course;
import com.academix.academix_backend.model.CourseStatus;
import com.academix.academix_backend.model.EnrollmentStatus;
import com.academix.academix_backend.model.Lesson;
import com.academix.academix_backend.model.User;
import com.academix.academix_backend.repository.CourseRepository;
import com.academix.academix_backend.repository.EnrollmentRepository;
import com.academix.academix_backend.repository.LessonRepository;
import com.academix.academix_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class LessonService {

    private final LessonRepository lessonRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Autowired
    public LessonService(LessonRepository lessonRepository,
                         CourseRepository courseRepository,
                         UserRepository userRepository,
                         EnrollmentRepository enrollmentRepository) {
        this.lessonRepository = lessonRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    

    @Transactional(readOnly = true)
    public List<Lesson> getLessons(Long courseId, String email, String role) {
        Course course = findCourse(courseId);
        checkCanRead(course, email, role);
        return course.getLessons().stream()
                .sorted(Comparator.comparing(Lesson::getOrderNumber,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<Lesson> getLesson(Long courseId, Long lessonId, String email, String role) {
        Course course = findCourse(courseId);
        checkCanRead(course, email, role);
        return lessonRepository.findById(lessonId)
                .filter(l -> l.getCourse().getId().equals(courseId));
    }

  

    @Transactional
    public Lesson addLesson(Long courseId, Lesson lesson, String email, boolean isAdmin) {
        Course course = findCourse(courseId);
        checkCanModify(course, email, isAdmin);
        lesson.setId(null);
        lesson.setCourse(course);
        return lessonRepository.save(lesson);
    }

    @Transactional
    public Lesson updateLesson(Long courseId, Long lessonId, Lesson updated,
                               String email, boolean isAdmin) {
        Course course = findCourse(courseId);
        checkCanModify(course, email, isAdmin);
        Lesson existing = findLessonInCourse(lessonId, courseId);

        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setContentUrl(updated.getContentUrl());
        existing.setOrderNumber(updated.getOrderNumber());
        existing.setDurationMinutes(updated.getDurationMinutes());
        existing.setUpdatedAt(LocalDateTime.now());
        return lessonRepository.save(existing);
    }

    @Transactional
    public void deleteLesson(Long courseId, Long lessonId, String email, boolean isAdmin) {
        Course course = findCourse(courseId);
        checkCanModify(course, email, isAdmin);
        Lesson existing = findLessonInCourse(lessonId, courseId);
        lessonRepository.delete(existing);
    }

    

    private Course findCourse(Long courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));
    }

    private Lesson findLessonInCourse(Long lessonId, Long courseId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found with id: " + lessonId));
        if (!lesson.getCourse().getId().equals(courseId)) {
            throw new RuntimeException("Lesson " + lessonId + " does not belong to course " + courseId);
        }
        return lesson;
    }

    
    private void checkCanRead(Course course, String email, String role) {
        if ("ADMIN".equals(role)) return;
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        if ("LECTURER".equals(role)) {
            if (!user.getId().equals(course.getInstructorId())) {
                throw new AccessDeniedException("You can only view lessons of your own courses");
            }
            return;
        }
        boolean enrolled = course.getStatus() == CourseStatus.PUBLISHED
                && enrollmentRepository.findByStudentIdAndCourseId(user.getId(), course.getId())
                        .filter(e -> e.getStatus() == EnrollmentStatus.ACTIVE)
                        .isPresent();
        if (!enrolled) {
            throw new AccessDeniedException("You are not enrolled in this course");
        }
    }

  
    private void checkCanModify(Course course, String email, boolean isAdmin) {
        if (isAdmin) return;
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        if (!user.getId().equals(course.getInstructorId())) {
            throw new AccessDeniedException("You can only modify lessons of your own courses");
        }
    }
}