package com.academix.academix_backend.controller;

import com.academix.academix_backend.model.Assignment;
import com.academix.academix_backend.service.AssignmentInstructionsService;
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

@RestController
@RequestMapping("/api/assignments/{id}/instructions")
public class AssignmentInstructionsController {

    private final AssignmentInstructionsService instructionsService;

    public AssignmentInstructionsController(AssignmentInstructionsService instructionsService) {
        this.instructionsService = instructionsService;
    }

    private String role(Authentication auth) {
        return auth.getAuthorities().iterator().next().getAuthority();
    }

    @PreAuthorize("hasAnyAuthority('LECTURER','ADMIN')")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public void upload(@PathVariable Long id,
                       @RequestParam("file") MultipartFile file,
                       Authentication auth) {
        instructionsService.upload(id, file, auth.getName(), "ADMIN".equals(role(auth)));
    }

    @PreAuthorize("hasAnyAuthority('STUDENT','LECTURER','ADMIN')")
    @GetMapping
    public ResponseEntity<Resource> download(@PathVariable Long id, Authentication auth) {
        Assignment assignment = instructionsService.getAuthorized(id, auth.getName(), role(auth));
        Resource resource = instructionsService.load(assignment);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline()
                                .filename(assignment.getInstructionsOriginalName(), StandardCharsets.UTF_8)
                                .build()
                                .toString())
                .body(resource);
    }
}