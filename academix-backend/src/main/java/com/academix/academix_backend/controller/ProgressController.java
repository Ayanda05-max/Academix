package com.academix.backend.controller;

import com.academix.backend.model.Progress;
import com.academix.backend.service.ProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    private final ProgressService progressService;

    @Autowired
    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @PostMapping("/complete")
    public Progress markComplete(@RequestParam Long studentId,
                                 @RequestParam Long courseId,
                                 @RequestParam Long lessonId) {
        return progressService.markLessonComplete(studentId, courseId, lessonId);
    }

    @GetMapping("/{studentId}/{courseId}")
    public List<Progress> getProgress(@PathVariable Long studentId, @PathVariable Long courseId) {
        return progressService.getStudentProgress(studentId, courseId);
    }
}