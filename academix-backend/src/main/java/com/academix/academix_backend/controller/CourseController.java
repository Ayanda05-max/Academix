package com.academix.academix_backend.controller;

import com.academix.academix_backend.model.Course;
import com.academix.academix_backend.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    @Autowired
    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    private boolean has(Authentication auth, String authority) {
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(authority));
    }

    private boolean isStaff(Authentication auth) {
        return has(auth, "ADMIN") || has(auth, "LECTURER");
    }

    @GetMapping
    public List<Course> getAllCourses(Authentication auth) {
        return courseService.getVisibleCourses(isStaff(auth));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id, Authentication auth) {
        return courseService.getVisibleCourse(id, isStaff(auth))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAnyAuthority('LECTURER','ADMIN')")
    @PostMapping
    public Course createCourse(@RequestBody Course course, Authentication auth) {
        return courseService.createCourse(course, auth.getName(), has(auth, "ADMIN"));
    }

    @PreAuthorize("hasAnyAuthority('LECTURER','ADMIN')")
    @PutMapping("/{id}")
    public Course updateCourse(@PathVariable Long id, @RequestBody Course course, Authentication auth) {
        return courseService.updateCourse(id, course, auth.getName(), has(auth, "ADMIN"));
    }

    @PreAuthorize("hasAnyAuthority('LECTURER','ADMIN')")
    @PutMapping("/{id}/publish")
    public Course publishCourse(@PathVariable Long id, Authentication auth) {
        return courseService.publishCourse(id, auth.getName(), has(auth, "ADMIN"));
    }
    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/{id}/instructor")
    public Course assignInstructor(@PathVariable Long id, @RequestParam Long instructorId) {
    return courseService.assignInstructor(id, instructorId);
}
   @PreAuthorize("hasAuthority('ADMIN')")
   @DeleteMapping("/{id}")
   public void deleteCourse(@PathVariable Long id,
                         @RequestParam(defaultValue = "false") boolean force) {
    courseService.deleteCourse(id, force);
}
}