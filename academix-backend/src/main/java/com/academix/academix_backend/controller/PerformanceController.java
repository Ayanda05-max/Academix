package com.academix.academix_backend.controller;

import com.academix.academix_backend.dto.CoursePerformanceResponse;
import com.academix.academix_backend.service.PerformanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/performance")
public class PerformanceController {

    @Autowired
    private PerformanceService performanceService;

    private boolean isAdmin(Authentication auth) {
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ADMIN"));
    }

    @PreAuthorize("hasAuthority('STUDENT')")
    @GetMapping("/me")
    public List<CoursePerformanceResponse> getMyPerformance(Authentication auth) {
        return performanceService.getMyPerformance(auth.getName());
    }

    @PreAuthorize("hasAnyAuthority('LECTURER','ADMIN')")
    @GetMapping("/course/{courseId}")
    public List<CoursePerformanceResponse> getCoursePerformance(@PathVariable Long courseId,
                                                                Authentication auth) {
        return performanceService.getCoursePerformance(courseId, auth.getName(), isAdmin(auth));
    }
}