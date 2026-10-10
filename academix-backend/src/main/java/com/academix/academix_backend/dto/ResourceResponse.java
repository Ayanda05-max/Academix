package com.academix.academix_backend.dto;

import java.time.LocalDateTime;

public record ResourceResponse(
        Long id,
        Long courseId,
        String title,
        String description,
        String fileName,
        String contentType,
        Long sizeBytes,
        LocalDateTime uploadedAt
) {}