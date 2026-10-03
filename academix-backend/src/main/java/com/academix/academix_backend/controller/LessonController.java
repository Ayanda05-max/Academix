package com.academix.academix_backend.controller;

import com.academix.academix_backend.model.Lesson;
import com.academix.academix_backend.service.LessonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses/{courseId}/lessons")
public class LessonController {

    private final LessonService lessonService;

    @Autowired
    public LessonController(LessonService lessonService) {
        this.lessonService = lessonService;
    }

    private boolean has(Authentication auth, String authority) {
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(authority));
    }

    private boolean isStaff(Authentication auth) {
        return has(auth, "ADMIN") || has(auth, "LECTURER");
    }

    @GetMapping
    public List<Lesson> getLessons(@PathVariable Long courseId, Authentication auth) {
        return lessonService.getLessons(courseId, isStaff(auth));
    }

    @GetMapping("/{lessonId}")
    public ResponseEntity<Lesson> getLesson(@PathVariable Long courseId,
                                            @PathVariable Long lessonId,
                                            Authentication auth) {
        return lessonService.getLesson(courseId, lessonId, isStaff(auth))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAnyAuthority('LECTURER','ADMIN')")
    @PostMapping
    public Lesson addLesson(@PathVariable Long courseId, @RequestBody Lesson lesson,
                            Authentication auth) {
        return lessonService.addLesson(courseId, lesson, auth.getName(), has(auth, "ADMIN"));
    }

    @PreAuthorize("hasAnyAuthority('LECTURER','ADMIN')")
    @PutMapping("/{lessonId}")
    public Lesson updateLesson(@PathVariable Long courseId, @PathVariable Long lessonId,
                               @RequestBody Lesson lesson, Authentication auth) {
        return lessonService.updateLesson(courseId, lessonId, lesson, auth.getName(), has(auth, "ADMIN"));
    }

    @PreAuthorize("hasAnyAuthority('LECTURER','ADMIN')")
    @DeleteMapping("/{lessonId}")
    public void deleteLesson(@PathVariable Long courseId, @PathVariable Long lessonId,
                             Authentication auth) {
        lessonService.deleteLesson(courseId, lessonId, auth.getName(), has(auth, "ADMIN"));
    }
}