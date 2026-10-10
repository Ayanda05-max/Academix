package com.academix.academix_backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "submissions")
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    // Optional link to the work (kept so link submissions still work)
    @Column(name = "file_url")
    private String fileUrl;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt = LocalDateTime.now();

    @Column(nullable = false)
    private String status;

    // Files the student attached. Deleting a submission deletes its file rows too.
    @OneToMany(mappedBy = "submission", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<SubmissionFile> files = new ArrayList<>();

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Assignment getAssignment() { return assignment; }
    public void setAssignment(Assignment assignment) { this.assignment = assignment; }

    public User getStudentId() { return student; }
    public void setStudentId(User student) { this.student = student; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<SubmissionFile> getFiles() { return files; }
    public void setFiles(List<SubmissionFile> files) { this.files = files; }
}
