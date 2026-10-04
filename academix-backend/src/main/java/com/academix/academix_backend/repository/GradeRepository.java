package com.academix.academix_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.academix.academix_backend.model.Grade;
import java.util.List;
import java.util.Optional;


@Repository 
public interface GradeRepository extends JpaRepository<Grade, Long>{
 
    public List<Grade> findByStudentId(Long studentId);

    public List<Grade> findByCourseId(Long courseId);

    public Optional<Grade> findBySubmissionId(Long submissionId);

    public List<Grade> findByStudentIdAndCourseId(Long studentId, Long courseId);
}
