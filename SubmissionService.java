package com.ecademix.academix_backend.service;

import com.ecademix.academix_backend.model.Assignment;
import com.ecademix.academix_backend.model.Submission;
import com.ecademix.academix_backend.repository.SubmissionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SubmissionService {

    private final SubmissionRepository submissionRepository;

    public SubmissionService(SubmissionRepository submissionRepository) {
        this.submissionRepository = submissionRepository;
    }

    public Submission submitAssignment(Submission submission) {
        Assignment assignment = submission.getAssignment();

        // Check if submitted after the deadline
        if (LocalDateTime.now().isAfter(assignment.getDueDate())) {
            submission.setStatus("LATE");
        } else {
            submission.setStatus("SUBMITTED");
        }

        submission.setSubmittedAt(LocalDateTime.now());

        return submissionRepository.save(submission);
    }

    public List<Submission> getSubmissionsByAssignment(Long assignmentId) {
        return submissionRepository.findByAssignmentId(assignmentId);
    }

    public List<Submission> getSubmissionsByStudent(Long studentId) {
        return submissionRepository.findByStudentId(studentId);
    }

    public Submission getSubmissionById(Long id) {
        Optional<Submission> result = submissionRepository.findById(id);

        if (result.isEmpty()) {
            throw new RuntimeException("Submission not found with id: " + id);
        }

        return result.get();
    }
}