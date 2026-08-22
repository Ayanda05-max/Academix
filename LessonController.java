package com.academix.courseflow_backend.controller;

import com.academix.courseflow_backend.entity.Lesson;
import com.academix.courseflow_backend.service.LessonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class LessonController {
    private final LessonService lessonService;

    @Autowired
    public LessonController(LessonService lessonService) {
        this.lessonService = lessonService;
    }
    @GetMapping("/courses/{courseId}/lessons")
    public List<Lesson> getLessonByCourse(@PathVariable Long courseId) {
        return lessonService.getLessonByCourse(courseId);
    }
    @GetMapping("/lessons/{id}")
    public ResponseEntity<Lesson> getLessonById(@PathVariable Long id) {
        return lessonService.getLessonById(id).map(ResponseEntity :: ok).orElse(ResponseEntity.notFound().build());
    }
    @PostMapping("/courses/{courseId}/lessons")
    public Lesson addLessonToCourse(@PathVariable Long courseId, @RequestBody Lesson lessons) {
        return lessonService.addLessonToCourse(courseId, lessons);
    }
    @PutMapping("/lesson/{id}")
    public Lesson updateLesson(@PathVariable Long id, @RequestBody Lesson lesson) {
        return lessonService.updateLesson(id, lesson);
    }
    @DeleteMapping("/lessons/{id}")
    public void deleteLesson(@PathVariable Long id) {
         lessonService.deleteLesson(id);
    }

}


