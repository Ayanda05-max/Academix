package com.academix.academix_backend.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.academix.academix_backend.service.GradeService;
import com.academix.academix_backend.model.Grade;
import com.academix.academix_backend.dto.GradeRequest;
import com.academix.academix_backend.dto.GradeResponse;
import java.util.List;

@RestController
@RequestMapping("/api/grades")
public class GradeController {
    
    @Autowired 
    private GradeService gradeService;

    @PostMapping 
    public GradeResponse recordGrade(@RequestBody GradeRequest request){
        return gradeService.recordGrade(request);
    }

   @PutMapping("/{id}")
    public GradeResponse updateGrade(@PathVariable Long id, 
                             @RequestBody GradeRequest request){
        return gradeService.updateGrade(id, request);
    }

    @GetMapping("/student/{studentId}")
    public List<GradeResponse> getGradesByStudent(@PathVariable Long studentId){
        return gradeService.getGradesByStudent(studentId);
    }

    @GetMapping("/course/{courseId}")
    public List<GradeResponse> getGradesByCourse(@PathVariable Long courseId){
        return gradeService.getGradesByCourse(courseId);
    }

    @GetMapping("/course/{courseId}/average")
    public Double getAverageForCourse(@PathVariable Long courseId){
    return gradeService.getAverageForCourse(courseId);
}
}
