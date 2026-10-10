package com.academix.academix_backend.dto;

import java.time.LocalDateTime;

public record QuizScoreResponse(
        Long id,
        Long quizId,
        Long studentId,
        Integer score,
        Integer totalMarks,
        Double percentage,
        LocalDateTime submittedAt
) {}