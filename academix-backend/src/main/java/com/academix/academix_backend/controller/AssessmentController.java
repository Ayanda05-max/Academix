package com.academix.academix_backend.controller;
import com.academix.academix_backend.model.Assignment;
import com.academix.academix_backend.model.Quiz;
import com.academix.academix_backend.model.Submission;
import com.academix.academix_backend.service.AssessmentService;
import com.academix.academix_backend.service.SubmissionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class AssessmentController {

    private final AssessmentService assessmentService;
    private final SubmissionService submissionService;

    public AssessmentController(AssessmentService assessmentService, SubmissionService submissionService) {
        this.assessmentService = assessmentService;
        this.submissionService = submissionService;
    }



    @PostMapping("/assignments")
    public Assignment createAssignment(@RequestBody Assignment assignment) {
        return assessmentService.createAssignment(assignment);
    }

    @GetMapping("/assignments/course/{id}")
    public List<Assignment> getAssignmentsByCourse(@PathVariable Long id) {
        return assessmentService.getAssignmentsByCourse(id);
    }

    @PostMapping("/assignments/{id}/submit")
    public Submission submitAssignment(@PathVariable Long id, @RequestBody Submission submission) {
        submission.setAssignment(assessmentService.getAssignmentById(id));
        return submissionService.submitAssignment(submission);
    }

    @GetMapping("/assignments/{id}/submissions")
    public List<Submission> getSubmissionsForAssignment(@PathVariable Long id) {
        return submissionService.getSubmissionsByAssignment(id);
    }



    @PostMapping("/quizzes")
    public Quiz createQuiz(@RequestBody Quiz quiz) {
        return assessmentService.createQuiz(quiz);
    }

    @GetMapping("/quizzes/course/{id}")
    public List<Quiz> getQuizzesByCourse(@PathVariable Long id) {
        return assessmentService.getQuizzesByCourse(id);
    }
}