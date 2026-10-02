package com.academix.academix_backend.repository;

import com.academix.academix_backend.model.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDateTime; 
@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    List<Assignment> findByCourse_Id(Long courseId);
    List<Assignment> findByDueDateBetween(LocalDateTime start, LocalDateTime end);
}