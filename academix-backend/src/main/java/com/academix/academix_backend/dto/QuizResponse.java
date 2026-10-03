package com.academix.academix_backend.dto;

import java.util.List;
import java.util.Map;

public record QuizResponse(
        Long id,
        Long courseId,
        String title,
        List<Map<String, Object>> questions,
        Integer timeLimit,
        Integer totalMarks
) {}
