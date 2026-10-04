package com.academix.academix_backend.dto;

import java.time.LocalDateTime;

public record SubmissionResponse(
        Long id,
        Long assignmentId,
        Long studentId,
        String studentName,
        String fileUrl,
        LocalDateTime submittedAt,
        String status
) {}
