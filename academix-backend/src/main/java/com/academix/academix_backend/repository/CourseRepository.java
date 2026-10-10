package com.academix.academix_backend.repository;

import com.academix.academix_backend.model.Course;
import com.academix.academix_backend.model.CourseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByStatus(CourseStatus status);
}
