package com.academix.academix_backend.service;

import com.academix.academix_backend.dto.SubmissionRequest;
import com.academix.academix_backend.dto.SubmissionResponse;
import com.academix.academix_backend.model.Assignment;
import com.academix.academix_backend.model.Course;
import com.academix.academix_backend.model.CourseStatus;
import com.academix.academix_backend.model.EnrollmentStatus;
import com.academix.academix_backend.model.Submission;
import com.academix.academix_backend.model.User;
import com.academix.academix_backend.repository.AssignmentRepository;
import com.academix.academix_backend.repository.EnrollmentRepository;
import com.academix.academix_backend.repository.SubmissionRepository;
import com.academix.academix_backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    public SubmissionService(SubmissionRepository submissionRepository,
                             AssignmentRepository assignmentRepository,
                             UserRepository userRepository,
                             EnrollmentRepository enrollmentRepository) {
        this.submissionRepository = submissionRepository;
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
    }


    // The student comes from the token; status and time are decided by the server
    public SubmissionResponse submit(Long assignmentId, SubmissionRequest request, String email) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Assignment not found with id: " + assignmentId));
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        Course course = assignment.getCourseId();

        if (course.getStatus() != CourseStatus.PUBLISHED || !isEnrolled(student.getId(), course.getId())) {
            throw new AccessDeniedException("You are not enrolled in this course");
        }
        if (request.getFileUrl() == null || request.getFileUrl().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "fileUrl is required");
        }

        boolean alreadySubmitted = submissionRepository.findByAssignmentId(assignmentId).stream()
                .anyMatch(s -> s.getStudentId().getId().equals(student.getId()));
        if (alreadySubmitted) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "You have already submitted this assignment");
        }

        LocalDateTime now = LocalDateTime.now();
        Submission submission = new Submission();
        submission.setAssignment(assignment);
        submission.setStudentId(student);
        submission.setFileUrl(request.getFileUrl().trim());
        submission.setSubmittedAt(now);
        submission.setStatus(now.isAfter(assignment.getDueDate()) ? "LATE" : "SUBMITTED");
        return toResponse(submissionRepository.save(submission));
    }

    // Admin: any assignment. Lecturer: only for their own courses.
    public List<SubmissionResponse> getSubmissionsForAssignment(Long assignmentId, String email, String role) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Assignment not found with id: " + assignmentId));

        if (!"ADMIN".equals(role)) {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
            if (!user.getId().equals(assignment.getCourseId().getInstructorId())) {
                throw new AccessDeniedException("You can only view submissions of your own courses");
            }
        }
        return submissionRepository.findByAssignmentId(assignmentId).stream()
                .map(this::toResponse)
                .toList();
    }



    public Submission submitAssignment(Submission submission) {
        Assignment assignment = submission.getAssignment();
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
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Submission not found with id: " + id);
        }
        return result.get();
    }

    

    private boolean isEnrolled(Long studentId, Long courseId) {
        return enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId)
                .filter(e -> e.getStatus() == EnrollmentStatus.ACTIVE)
                .isPresent();
    }

    private SubmissionResponse toResponse(Submission s) {
        User student = s.getStudentId();
        return new SubmissionResponse(
                s.getId(),
                s.getAssignment().getId(),
                student.getId(),
                student.getFirstName() + " " + student.getLastName(),
                s.getFileUrl(),
                s.getSubmittedAt(),
                s.getStatus());
    }
      
    public List<SubmissionResponse> getMySubmissions(String email) {
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        return submissionRepository.findByStudentId(student.getId()).stream()
                .map(this::toResponse)
                .toList();
    }
}