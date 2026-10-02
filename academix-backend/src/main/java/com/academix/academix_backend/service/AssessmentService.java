package com.academix.academix_backend.service;

import com.academix.academix_backend.model.Assignment;
import com.academix.academix_backend.model.Quiz;
import com.academix.academix_backend.repository.AssignmentRepository;
import com.academix.academix_backend.repository.QuizRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AssessmentService {

    private final AssignmentRepository assignmentRepository;
    private final QuizRepository quizRepository;

    public AssessmentService(AssignmentRepository assignmentRepository, QuizRepository quizRepository) {
        this.assignmentRepository = assignmentRepository;
        this.quizRepository = quizRepository;
    }

    // ----- Assignments -----

    public Assignment createAssignment(Assignment assignment) {
        return assignmentRepository.save(assignment);
    }

    public List<Assignment> getAssignmentsByCourse(Long courseId) {
        return assignmentRepository.findByCourse_Id(courseId);
    }

    public Assignment getAssignmentById(Long id) {
        Optional<Assignment> result = assignmentRepository.findById(id);

        if (result.isEmpty()) {
            throw new RuntimeException("Assignment not found with id: " + id);
        }

        return result.get();
    }

    // ----- Quizzes -----

    public Quiz createQuiz(Quiz quiz) {
        return quizRepository.save(quiz);
    }

    public List<Quiz> getQuizzesByCourse(Long courseId) {
        return quizRepository.findByCourseId(courseId);
    }

    public Quiz getQuizById(Long id) {
        Optional<Quiz> result = quizRepository.findById(id);

        if (result.isEmpty()) {
            throw new RuntimeException("Quiz not found with id: " + id);
        }

        return result.get();
    }

    // Simple auto-grading placeholder — takes the student's answers and
    // compares them against the correct answers, returns a score.
    // We'll build this out properly once QuizRequest/QuizResultResponse exist.
    public int calculateQuizScore(Quiz quiz, List<String> studentAnswers, List<String> correctAnswers) {
        int score = 0;
        for (int i = 0; i < correctAnswers.size(); i++) {
            if (i < studentAnswers.size() && studentAnswers.get(i).equals(correctAnswers.get(i))) {
                score++;
            }
        }
        return score;
    }
}