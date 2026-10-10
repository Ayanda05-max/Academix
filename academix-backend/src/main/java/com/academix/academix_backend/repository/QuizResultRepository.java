package com.academix.academix_backend.repository;

import com.academix.academix_backend.model.QuizResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizResultRepository extends JpaRepository<QuizResult, Long> {

    Optional<QuizResult> findByQuizIdAndStudentId(Long quizId, Long studentId);

    List<QuizResult> findByQuizId(Long quizId);

    List<QuizResult> findByStudentId(Long studentId);
}