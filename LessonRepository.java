package com.academix.courseflow_backend.repository;

import com.academix.courseflow_backend.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
}
