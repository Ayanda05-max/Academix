package com.ecademix.academix_backend.dto;

public class SubmissionRequest {

    private Long studentId;
    private String fileUrl;

    // Getters and setters
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
}