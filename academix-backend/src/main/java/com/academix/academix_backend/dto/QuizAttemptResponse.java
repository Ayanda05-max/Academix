package com.academix.academix_backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public record QuizAttemptResponse(
        Long resultId,
        Long studentId,
        String studentName,
        String studentEmail,
        int score,
        int totalMarks,
        double percentage,
        LocalDateTime submittedAt,
        List<Integer> answers) {
}