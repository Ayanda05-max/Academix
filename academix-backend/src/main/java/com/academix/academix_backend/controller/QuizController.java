package com.academix.academix_backend.controller;

import com.academix.academix_backend.dto.QuizCreateRequest;
import com.academix.academix_backend.dto.QuizResponse;
import com.academix.academix_backend.dto.QuizScoreResponse;
import com.academix.academix_backend.dto.QuizSubmitRequest;
import com.academix.academix_backend.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    private final QuizService quizService;

    @Autowired
    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    private String role(Authentication auth) {
        return auth.getAuthorities().iterator().next().getAuthority();
    }

    @PreAuthorize("hasAnyAuthority('LECTURER','ADMIN')")
    @PostMapping
    public QuizResponse createQuiz(@RequestBody QuizCreateRequest request, Authentication auth) {
        return quizService.createQuiz(request, auth.getName(), "ADMIN".equals(role(auth)));
    }

    @GetMapping("/course/{courseId}")
    public List<QuizResponse> getQuizzesByCourse(@PathVariable Long courseId, Authentication auth) {
        return quizService.getQuizzesForCourse(courseId, auth.getName(), role(auth));
    }

    @PreAuthorize("hasAuthority('STUDENT')")
    @PostMapping("/{quizId}/submit")
    public QuizScoreResponse submit(@PathVariable Long quizId,
                                    @RequestBody QuizSubmitRequest request,
                                    Authentication auth) {
        return quizService.submit(quizId, request, auth.getName());
    }

    @GetMapping("/{quizId}/results/{studentId}")
    public QuizScoreResponse getResult(@PathVariable Long quizId,
                                       @PathVariable Long studentId,
                                       Authentication auth) {
        return quizService.getResult(quizId, studentId, auth.getName(), role(auth));
    }
}
