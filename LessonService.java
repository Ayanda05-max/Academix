package com.academix.courseflow_backend.service;

import com.academix.courseflow_backend.entity.Course;
import com.academix.courseflow_backend.entity.Lesson;
import com.academix.courseflow_backend.repository.CourseRepository;
import com.academix.courseflow_backend.repository.LessonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class LessonService {
    private final LessonRepository lessonRepository;
    private final CourseRepository courseRepository;

    @Autowired
    public LessonService(LessonRepository lessonRepository, CourseRepository courseRepository) {
        this.lessonRepository = lessonRepository;
        this.courseRepository = courseRepository;
    }
    public List<Lesson> getLessonByCourse(Long courseId) {
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId ));
        return course.getLessons();
    }
    public Optional<Lesson> getLessonById(Long id) {
        return lessonRepository.findById(id);
    }
    public Lesson addLessonToCourse(Long courseId, Lesson lesson) {
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new RuntimeException("Course not found with this id: " + courseId));
        course.addLesson(lesson);
        courseRepository.save(course);
        return lesson;
    }

    public Lesson updateLesson(Long id, Lesson updatedLesson) {
        Lesson existingLesson = lessonRepository.findById(id).orElseThrow(() -> new RuntimeException("Lesson not found with id: " + id ));

        existingLesson.setTitle(updatedLesson.getTitle());
        existingLesson.setDescription(updatedLesson.getDescription());
        existingLesson.setContentUrl(updatedLesson.getContentUrl());
        existingLesson.setOrderNumber(updatedLesson.getOrderNumber());
        existingLesson.setDurationMinutes(updatedLesson.getDurationMinutes());
        existingLesson.setUpdatedAt(updatedLesson.getUpdatedAt());

        return lessonRepository.save(existingLesson);
    }

    public void deleteLesson(Long id) {
        lessonRepository.deleteById(id);
    }
}
