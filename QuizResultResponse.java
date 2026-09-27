package com.ecademix.academix_backend.dto;

public class QuizResultResponse {

    private Long quizId;
    private Long studentId;
    private int score;
    private int totalMarks;

    public QuizResultResponse(Long quizId, Long studentId, int score, int totalMarks) {
        this.quizId = quizId;
        this.studentId = studentId;
        this.score = score;
        this.totalMarks = totalMarks;
    }

    // Getters and setters
    public Long getQuizId() { return quizId; }
    public void setQuizId(Long quizId) { this.quizId = quizId; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public int getTotalMarks() { return totalMarks; }
    public void setTotalMarks(int totalMarks) { this.totalMarks = totalMarks; }
}