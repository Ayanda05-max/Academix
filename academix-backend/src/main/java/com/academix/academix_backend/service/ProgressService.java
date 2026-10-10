package com.academix.academix_backend.service;

import com.academix.academix_backend.dto.ProgressSummary;
import com.academix.academix_backend.model.Course;
import com.academix.academix_backend.model.CourseStatus;
import com.academix.academix_backend.model.EnrollmentStatus;
import com.academix.academix_backend.model.Lesson;
import com.academix.academix_backend.model.Progress;
import com.academix.academix_backend.model.User;
import com.academix.academix_backend.repository.CourseRepository;
import com.academix.academix_backend.repository.EnrollmentRepository;
import com.academix.academix_backend.repository.LessonRepository;
import com.academix.academix_backend.repository.ProgressRepository;
import com.academix.academix_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProgressService {

    private final ProgressRepository progressRepository;
    private final LessonRepository lessonRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Autowired
    public ProgressService(ProgressRepository progressRepository,
                           LessonRepository lessonRepository,
                           CourseRepository courseRepository,
                           UserRepository userRepository,
                           EnrollmentRepository enrollmentRepository) {
        this.progressRepository = progressRepository;
        this.lessonRepository = lessonRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    
    @Transactional
    public Progress markLessonComplete(Long courseId, Long lessonId, String email) {
        User student = findUser(email);
        Course course = findCourse(courseId);

        boolean enrolled = course.getStatus() == CourseStatus.PUBLISHED
                && enrollmentRepository.findByStudentIdAndCourseId(student.getId(), courseId)
                        .filter(e -> e.getStatus() == EnrollmentStatus.ACTIVE)
                        .isPresent();
        if (!enrolled) {
            throw new AccessDeniedException("You are not enrolled in this course");
        }

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Lesson not found with id: " + lessonId));
        if (!lesson.getCourse().getId().equals(courseId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Lesson " + lessonId + " does not belong to course " + courseId);
        }

        Progress progress = progressRepository
                .findByStudentIdAndCourseIdAndLessonId(student.getId(), courseId, lessonId)
                .orElse(Progress.builder()
                        .studentId(student.getId())
                        .courseId(courseId)
                        .lessonId(lessonId)
                        .build());

       
        if (!Boolean.TRUE.equals(progress.getCompleted())) {
            progress.setCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());
        }
        return progressRepository.save(progress);
    }

   
    @Transactional(readOnly = true)
    public ProgressSummary getProgressSummary(Long studentId, Long courseId,
                                              String email, String role) {
        Course course = findCourse(courseId);
        User user = findUser(email);

        if ("LECTURER".equals(role)) {
            if (!user.getId().equals(course.getInstructorId())) {
                throw new AccessDeniedException("You can only view progress of your own courses");
            }
        } else if (!"ADMIN".equals(role)) {
            if (!user.getId().equals(studentId)) {
                throw new AccessDeniedException("You can only view your own progress");
            }
        }

        List<Long> completedIds = progressRepository
                .findByStudentIdAndCourseId(studentId, courseId).stream()
                .filter(p -> Boolean.TRUE.equals(p.getCompleted()))
                .map(Progress::getLessonId)
                .toList();

        int total = course.getLessons().size();
        double percentage = total == 0
                ? 0.0
                : Math.round(completedIds.size() * 1000.0 / total) / 10.0;

        return new ProgressSummary(studentId, courseId, completedIds.size(),
                total, percentage, completedIds);
    }

   

    private Course findCourse(Long courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Course not found with id: " + courseId));
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                        "User not found"));
    }
}