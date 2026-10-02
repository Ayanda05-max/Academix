package com.academix.backend.repository;

import com.academix.backend.model.Progress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProgressRepository extends JpaRepository<Progress, Long>{
    List<Progress> findByStudentIdAndCourseId(Long studentId, Long courseId);
     Optional<Progress> findByStudentIdAndCourseIdAndLessonId(Long studentId, Long courseId,Long lessonId);
}
