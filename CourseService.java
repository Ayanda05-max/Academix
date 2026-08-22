package com.academix.courseflow_backend.service;

import com.academix.courseflow_backend.entity.Course;
import com.academix.courseflow_backend.entity.CourseStatus;
import com.academix.courseflow_backend.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

@Service

public class CourseService {
    private final CourseRepository courseRepository;

    @Autowired
    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    public List<Course> getAllCourse() {
        return courseRepository.findAll();
    }

    public Optional<Course> getCourseById(Long id) {
        return courseRepository.findById(id);
    }
    public Course createCourse(Course course) {
        course.setStatus(CourseStatus.DRAFT);
        return courseRepository.save(course);
    }

   public Course updateCourse(Long id, Course updatedCourse) {
        Course existingCourse = courseRepository.findById(id).orElseThrow(() -> new RuntimeException("COurse not found with id: " + id));

        existingCourse.setTitle(updatedCourse.getTitle());
       existingCourse.setDescription(updatedCourse.getDescription());
        existingCourse.setCategory(updatedCourse.getCategory());
        existingCourse.setInstructorId(updatedCourse.getInstructorId());
        existingCourse.setInstructorName(updatedCourse.getInstructorName());
        existingCourse.setUpdatedAt(updatedCourse.getUpdatedAt());

        return courseRepository.save(existingCourse);
   }
   public Course publishCourse(Long id) {
        Course course = courseRepository.findById(id).orElseThrow(() -> new RuntimeException("Course not found with id: " + id));

        if (course.getLessons().isEmpty()) {
            throw new RuntimeException("Cannot publish a course with no lessons");
        }
        course.setStatus(CourseStatus.PUBLISHED);
        course.setUpdatedAt(LocalDateTime.now());
        return courseRepository.save(course);
   }
   public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
   }
}
