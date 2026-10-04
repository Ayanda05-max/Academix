package com.academix.academix_backend.controller;

import com.academix.academix_backend.dto.AssignmentRequest;
import com.academix.academix_backend.dto.AssignmentResponse;
import com.academix.academix_backend.dto.SubmissionRequest;
import com.academix.academix_backend.dto.SubmissionResponse;
import com.academix.academix_backend.service.AssessmentService;
import com.academix.academix_backend.service.SubmissionService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class AssessmentController {

    private final AssessmentService assessmentService;
    private final SubmissionService submissionService;

    public AssessmentController(AssessmentService assessmentService, SubmissionService submissionService) {
        this.assessmentService = assessmentService;
        this.submissionService = submissionService;
    }

    private String role(Authentication auth) {
        return auth.getAuthorities().iterator().next().getAuthority();
    }

    @PreAuthorize("hasAnyAuthority('LECTURER','ADMIN')")
    @PostMapping("/assignments")
    public AssignmentResponse createAssignment(@RequestBody AssignmentRequest request, Authentication auth) {
        return assessmentService.createAssignment(request, auth.getName(), "ADMIN".equals(role(auth)));
    }

    @GetMapping("/assignments/course/{id}")
    public List<AssignmentResponse> getAssignmentsByCourse(@PathVariable Long id, Authentication auth) {
        return assessmentService.getAssignmentsForCourse(id, auth.getName(), role(auth));
    }

    @PreAuthorize("hasAuthority('STUDENT')")
    @PostMapping("/assignments/{id}/submit")
    public SubmissionResponse submitAssignment(@PathVariable Long id,
                                               @RequestBody SubmissionRequest request,
                                               Authentication auth) {
        return submissionService.submit(id, request, auth.getName());
    }

    @PreAuthorize("hasAnyAuthority('LECTURER','ADMIN')")
    @GetMapping("/assignments/{id}/submissions")
    public List<SubmissionResponse> getSubmissionsForAssignment(@PathVariable Long id, Authentication auth) {
        return submissionService.getSubmissionsForAssignment(id, auth.getName(), role(auth));
    }
    @PreAuthorize("hasAuthority('STUDENT')")
    @GetMapping("/submissions/me")
    public List<SubmissionResponse> getMySubmissions(Authentication auth) {
        return submissionService.getMySubmissions(auth.getName());
    }
}