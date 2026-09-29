package com.academix.backend.controller;

import com.academix.backend.entity.Enrollment;
import com.academix.backend.service.EnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")

public class EnrollmentController {
    private final EnrollmentService enrollmentService;

    @Autowired
    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }


    @PostMapping
    public Enrollment enroll(@RequestParam Long studentId, @RequestParam Long courseId) {
        return enrollmentService.enrollStudent(studentId, courseId);
    }

    @DeleteMapping("/enroll")
    public void unenroll(@RequestParam Long studentId, @RequestParam Long courseId) {
        enrollmentService.unenrollStudent(studentId, courseId);
    }

    @GetMapping("/enrollments/student/{id}")
    public List<Enrollment> getEnrollmentsByStudent( Long id) {
        return enrollmentService.getEnrollmentsByStudent(id);
    }
    @GetMapping("/enrollments/course/{id}")
    public List<Enrollment> getEnrollmentsByCourse(@PathVariable Long id) {
        return enrollmentService.getEnrollmentsByCourse(id);
    }

}
