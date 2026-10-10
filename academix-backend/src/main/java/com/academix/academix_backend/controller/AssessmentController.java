package com.academix.academix_backend.controller;

import com.academix.academix_backend.dto.AssignmentRequest;
import com.academix.academix_backend.dto.AssignmentResponse;
import com.academix.academix_backend.dto.SubmissionResponse;
import com.academix.academix_backend.model.SubmissionFile;
import com.academix.academix_backend.service.AssessmentService;
import com.academix.academix_backend.service.SubmissionService;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
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

    // Students submit by attaching files (multipart form field "files", repeatable)
    @PreAuthorize("hasAuthority('STUDENT')")
    @PostMapping(value = "/assignments/{id}/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public SubmissionResponse submitAssignmentWithFiles(@PathVariable Long id,
                                                        @RequestParam(value = "files", required = false) List<MultipartFile> files,
                                                        Authentication auth) {
        return submissionService.submitWithFiles(id, files, auth.getName());
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

    // Download one attached file. The owner, the course lecturer and admins may open it.
    @PreAuthorize("hasAnyAuthority('STUDENT','LECTURER','ADMIN')")
    @GetMapping("/submissions/files/{fileId}")
    public ResponseEntity<Resource> downloadSubmissionFile(@PathVariable Long fileId, Authentication auth) {
        SubmissionFile file = submissionService.getAuthorizedFile(fileId, auth.getName(), role(auth));
        Resource resource = submissionService.loadFile(file);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename(file.getOriginalName(), StandardCharsets.UTF_8)
                                .build()
                                .toString())
                .body(resource);
    }
}
