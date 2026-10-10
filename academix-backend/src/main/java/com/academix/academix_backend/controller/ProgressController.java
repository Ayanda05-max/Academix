package com.academix.academix_backend.controller;

import com.academix.academix_backend.dto.ProgressSummary;
import com.academix.academix_backend.model.Progress;
import com.academix.academix_backend.service.ProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    private final ProgressService progressService;

    @Autowired
    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    private String role(Authentication auth) {
        return auth.getAuthorities().iterator().next().getAuthority();
    }

    @PreAuthorize("hasAuthority('STUDENT')")
    @PostMapping("/complete")
    public Progress markComplete(@RequestParam Long courseId,
                                 @RequestParam Long lessonId,
                                 Authentication auth) {
        return progressService.markLessonComplete(courseId, lessonId, auth.getName());
    }

    @GetMapping("/{studentId}/{courseId}")
    public ProgressSummary getProgress(@PathVariable Long studentId,
                                       @PathVariable Long courseId,
                                       Authentication auth) {
        return progressService.getProgressSummary(studentId, courseId,
                auth.getName(), role(auth));
    }
}