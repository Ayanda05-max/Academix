package com.academix.academix_backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public class SubmissionResponse {

    private final Long id;
    private final Long assignmentId;
    private final Long studentId;
    private final String studentName;
    private final String fileUrl;
    private final LocalDateTime submittedAt;
    private final String status;
    private final List<SubmissionFileResponse> files;

    public SubmissionResponse(Long id, Long assignmentId, Long studentId, String studentName,
                              String fileUrl, LocalDateTime submittedAt, String status,
                              List<SubmissionFileResponse> files) {
        this.id = id;
        this.assignmentId = assignmentId;
        this.studentId = studentId;
        this.studentName = studentName;
        this.fileUrl = fileUrl;
        this.submittedAt = submittedAt;
        this.status = status;
        this.files = files;
    }

    // Older code that builds a response without files still works
    public SubmissionResponse(Long id, Long assignmentId, Long studentId, String studentName,
                              String fileUrl, LocalDateTime submittedAt, String status) {
        this(id, assignmentId, studentId, studentName, fileUrl, submittedAt, status, List.of());
    }

    public Long getId() { return id; }
    public Long getAssignmentId() { return assignmentId; }
    public Long getStudentId() { return studentId; }
    public String getStudentName() { return studentName; }
    public String getFileUrl() { return fileUrl; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public String getStatus() { return status; }
    public List<SubmissionFileResponse> getFiles() { return files; }
}
