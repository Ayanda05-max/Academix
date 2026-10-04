package com.academix.academix_backend.dto;

import java.util.List;

public record ProgressSummary(
        Long studentId,
        Long courseId,
        int completedLessons,
        int totalLessons,
        double completionPercentage,
        List<Long> completedLessonIds
) {}