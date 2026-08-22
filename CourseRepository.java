package com.academix.courseflow_backend.repository;

import com.academix.courseflow_backend.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {
}
