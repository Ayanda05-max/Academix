package com.academix.academix_backend.dto;

import java.time.LocalDateTime;

public record AssignmentResponse(
        Long id,
        Long courseId,
        String title,
        String description,
        LocalDateTime dueDate,
        Integer totalMarks,
        String instructionsFileName
) {}