package com.academix.academix_backend.service;

import com.academix.academix_backend.model.Course;
import com.academix.academix_backend.model.CourseStatus;
import com.academix.academix_backend.model.User;
import com.academix.academix_backend.repository.CourseRepository;
import com.academix.academix_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @Autowired
    public CourseService(CourseRepository courseRepository, UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    // Staff see every course; students only see PUBLISHED ones
    public List<Course> getVisibleCourses(boolean isStaff) {
        return isStaff ? courseRepository.findAll()
                       : courseRepository.findByStatus(CourseStatus.PUBLISHED);
    }

    public Optional<Course> getVisibleCourse(Long id, boolean isStaff) {
        return courseRepository.findById(id)
                .filter(c -> isStaff || c.getStatus() == CourseStatus.PUBLISHED);
    }

    public Course createCourse(Course course, String email, boolean isAdmin) {
        User creator = findUser(email);
        // Lecturers own their courses; an admin may name another instructor
        Long instructorId = (isAdmin && course.getInstructorId() != null)
                ? course.getInstructorId() : creator.getId();
        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new RuntimeException("Instructor not found with id: " + instructorId));

        course.setId(null);
        course.setStatus(CourseStatus.DRAFT);
        course.setLessons(new ArrayList<>());
        course.setInstructorId(instructor.getId());
        course.setInstructorName(instructor.getFirstName() + " " + instructor.getLastName());
        return courseRepository.save(course);
    }

    public Course updateCourse(Long id, Course updated, String email, boolean isAdmin) {
        Course existing = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));
        checkCanModify(existing, email, isAdmin);

        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setCategory(updated.getCategory());
        // Only an admin may reassign the instructor
        if (isAdmin && updated.getInstructorId() != null) {
            User instructor = userRepository.findById(updated.getInstructorId())
                    .orElseThrow(() -> new RuntimeException("Instructor not found"));
            existing.setInstructorId(instructor.getId());
            existing.setInstructorName(instructor.getFirstName() + " " + instructor.getLastName());
        }
        existing.setUpdatedAt(LocalDateTime.now());
        return courseRepository.save(existing);
    }
    @Transactional
    public Course publishCourse(Long id, String email, boolean isAdmin) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));
        checkCanModify(course, email, isAdmin);

        if (course.getLessons() == null || course.getLessons().isEmpty()) {
            throw new RuntimeException("Cannot publish a course with no lessons");
        }
        course.setStatus(CourseStatus.PUBLISHED);
        course.setUpdatedAt(LocalDateTime.now());
        return courseRepository.save(course);
    }

    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }

    // A lecturer may only change their own courses
    private void checkCanModify(Course course, String email, boolean isAdmin) {
        if (isAdmin) return;
        User user = findUser(email);
        if (!user.getId().equals(course.getInstructorId())) {
            throw new AccessDeniedException("You can only modify your own courses");
        }
    }
}