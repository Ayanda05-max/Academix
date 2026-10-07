package com.academix.academix_backend.repository;

import com.academix.academix_backend.model.CourseResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseResourceRepository extends JpaRepository<CourseResource, Long> {

    List<CourseResource> findByCourseIdOrderByUploadedAtDesc(Long courseId);
}