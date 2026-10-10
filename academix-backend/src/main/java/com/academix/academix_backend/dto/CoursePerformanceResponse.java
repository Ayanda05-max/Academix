package com.academix.academix_backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public record CoursePerformanceResponse(
        Long courseId,
        String courseTitle,
        Long studentId,
        String studentName,
        String studentEmail,
        Double assignmentPercent,
        Double quizPercent,
        Double overallPercent,
        Double progressPercent,
        int completedItems,
        int totalItems,
        List<AssignmentItem> assignments,
        List<QuizItem> quizzes) {

    public record AssignmentItem(
            Long assignmentId,
            String title,
            String status,
            Integer marksAwarded,
            Integer totalMarks,
            String feedback,
            LocalDateTime gradedAt) {
    }

    public record QuizItem(
            Long quizId,
            String title,
            String status,
            Integer score,
            Integer totalMarks) {
    }
}