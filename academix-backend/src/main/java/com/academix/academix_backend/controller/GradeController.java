package com.academix.academix_backend.controller;

import com.academix.academix_backend.dto.GradeRequest;
import com.academix.academix_backend.dto.GradeResponse;
import com.academix.academix_backend.service.GradeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grades")
public class GradeController {

    @Autowired
    private GradeService gradeService;

    private String role(Authentication auth) {
        return auth.getAuthorities().iterator().next().getAuthority();
    }

    @PreAuthorize("hasAnyAuthority('LECTURER','ADMIN')")
    @PostMapping
    public GradeResponse recordGrade(@RequestBody GradeRequest request, Authentication auth) {
        return gradeService.recordGrade(request, auth.getName(), "ADMIN".equals(role(auth)));
    }

    @PreAuthorize("hasAnyAuthority('LECTURER','ADMIN')")
    @PutMapping("/{id}")
    public GradeResponse updateGrade(@PathVariable Long id,
                                     @RequestBody GradeRequest request,
                                     Authentication auth) {
        return gradeService.updateGrade(id, request, auth.getName(), "ADMIN".equals(role(auth)));
    }

    @GetMapping("/student/{studentId}")
    public List<GradeResponse> getGradesByStudent(@PathVariable Long studentId, Authentication auth) {
        return gradeService.getGradesByStudent(studentId, auth.getName(), role(auth));
    }

    @PreAuthorize("hasAnyAuthority('LECTURER','ADMIN')")
    @GetMapping("/course/{courseId}")
    public List<GradeResponse> getGradesByCourse(@PathVariable Long courseId, Authentication auth) {
        return gradeService.getGradesByCourse(courseId, auth.getName(), "ADMIN".equals(role(auth)));
    }

    @PreAuthorize("hasAnyAuthority('LECTURER','ADMIN')")
    @GetMapping("/course/{courseId}/average")
    public Double getAverageForCourse(@PathVariable Long courseId, Authentication auth) {
        return gradeService.getAverageForCourse(courseId, auth.getName(), "ADMIN".equals(role(auth)));
    }
}