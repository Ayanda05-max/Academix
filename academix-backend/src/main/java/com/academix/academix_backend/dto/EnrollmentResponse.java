package com.academix.academix_backend.dto;

import java.time.LocalDateTime;

public record EnrollmentResponse(
        Long id,
        Long studentId,
        String studentName,
        String studentEmail,
        Long courseId,
        String courseTitle,
        LocalDateTime enrolledAt,
        String status
) {}
