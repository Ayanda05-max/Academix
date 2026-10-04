package com.academix.academix_backend.controller;
import com.academix.academix_backend.dto.EnrollmentResponse;
import com.academix.academix_backend.model.Enrollment;
import com.academix.academix_backend.service.EnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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

    private boolean isAdmin(Authentication auth) {
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ADMIN"));
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/enroll")
    public Enrollment enroll(@RequestParam Long studentId, @RequestParam Long courseId) {
        return enrollmentService.enrollStudent(studentId, courseId);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/enroll")
    public void unenroll(@RequestParam Long studentId, @RequestParam Long courseId) {
        enrollmentService.unenrollStudent(studentId, courseId);
    }

      @GetMapping("/enrollments/student/{id}")
    public List<EnrollmentResponse> getEnrollmentsByStudent(@PathVariable Long id, Authentication auth) {
        return enrollmentService.getEnrollmentResponsesByStudent(id, auth.getName(), isAdmin(auth));
    }

    @PreAuthorize("hasAnyAuthority('LECTURER','ADMIN')")
    @GetMapping("/enrollments/course/{id}")
    public List<EnrollmentResponse> getEnrollmentsByCourse(@PathVariable Long id, Authentication auth) {
        return enrollmentService.getEnrollmentResponsesByCourse(id, auth.getName(), isAdmin(auth));
    }
}