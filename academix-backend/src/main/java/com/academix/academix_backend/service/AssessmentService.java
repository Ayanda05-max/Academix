package com.academix.academix_backend.service;

import com.academix.academix_backend.dto.AssignmentRequest;
import com.academix.academix_backend.dto.AssignmentResponse;
import com.academix.academix_backend.model.Assignment;
import com.academix.academix_backend.model.Course;
import com.academix.academix_backend.model.CourseStatus;
import com.academix.academix_backend.model.EnrollmentStatus;
import com.academix.academix_backend.model.Quiz;
import com.academix.academix_backend.model.User;
import com.academix.academix_backend.repository.AssignmentRepository;
import com.academix.academix_backend.repository.CourseRepository;
import com.academix.academix_backend.repository.EnrollmentRepository;
import com.academix.academix_backend.repository.QuizRepository;
import com.academix.academix_backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class AssessmentService {

    private static final Logger log = LoggerFactory.getLogger(AssessmentService.class);

    private final AssignmentRepository assignmentRepository;
    private final QuizRepository quizRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final NotificationService notificationService;

    public AssessmentService(AssignmentRepository assignmentRepository,
                             QuizRepository quizRepository,
                             CourseRepository courseRepository,
                             UserRepository userRepository,
                             EnrollmentRepository enrollmentRepository,
                             NotificationService notificationService) {
        this.assignmentRepository = assignmentRepository;
        this.quizRepository = quizRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.notificationService = notificationService;
    }

    public AssignmentResponse createAssignment(AssignmentRequest request, String email, boolean isAdmin) {
        if (request.getCourseId() == null) throw bad("courseId is required");
        if (request.getTitle() == null || request.getTitle().isBlank()) throw bad("title is required");
        if (request.getDescription() == null || request.getDescription().isBlank()) throw bad("description is required");
        if (request.getDueDate() == null) throw bad("dueDate is required");
        if (request.getTotalMarks() == null || request.getTotalMarks() <= 0) throw bad("totalMarks must be greater than 0");

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Course not found with id: " + request.getCourseId()));

        if (!isAdmin) {
            User user = findUser(email);
            if (!user.getId().equals(course.getInstructorId())) {
                throw new AccessDeniedException("You can only add assignments to your own courses");
            }
        }
        String title = request.getTitle().trim();
        if (assignmentRepository.existsByCourse_IdAndTitleIgnoreCase(course.getId(), title)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
            "An assignment named \"" + title + "\" already exists in this course");
}
        Assignment assignment = new Assignment();
        assignment.setCourse(course);
        assignment.setTitle(title);
        assignment.setDescription(request.getDescription().trim());
        assignment.setDueDate(request.getDueDate());
        assignment.setTotalMarks(request.getTotalMarks());
        Assignment saved = assignmentRepository.save(assignment);

        try {
            notificationService.notifyNewAssignment(course.getId(), saved.getTitle());
        } catch (Exception e) {
            log.warn("Assignment saved but notification failed: {}", e.getMessage());
        }
        return toResponse(saved);
    }

    public List<AssignmentResponse> getAssignmentsForCourse(Long courseId, String email, String role) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Course not found with id: " + courseId));
        User user = findUser(email);

        if ("ADMIN".equals(role)) {

        } else if ("LECTURER".equals(role)) {
            if (!user.getId().equals(course.getInstructorId())) {
                throw new AccessDeniedException("You can only view assignments of your own courses");
            }
        } else {
            if (course.getStatus() != CourseStatus.PUBLISHED || !isEnrolled(user.getId(), courseId)) {
                throw new AccessDeniedException("You are not enrolled in this course");
            }
        }

        return assignmentRepository.findByCourse_Id(courseId).stream()
                .map(this::toResponse)
                .toList();
    }

    public Assignment createAssignment(Assignment assignment) {
        return assignmentRepository.save(assignment);
    }

    public List<Assignment> getAssignmentsByCourse(Long courseId) {
        return assignmentRepository.findByCourse_Id(courseId);
    }

    public Assignment getAssignmentById(Long id) {
        Optional<Assignment> result = assignmentRepository.findById(id);
        if (result.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found with id: " + id);
        }
        return result.get();
    }

    public Quiz createQuiz(Quiz quiz) {
        return quizRepository.save(quiz);
    }

    public List<Quiz> getQuizzesByCourse(Long courseId) {
        return quizRepository.findByCourseId(courseId);
    }

    public Quiz getQuizById(Long id) {
        Optional<Quiz> result = quizRepository.findById(id);
        if (result.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found with id: " + id);
        }
        return result.get();
    }

    public int calculateQuizScore(Quiz quiz, List<String> studentAnswers, List<String> correctAnswers) {
        int score = 0;
        for (int i = 0; i < correctAnswers.size(); i++) {
            if (i < studentAnswers.size() && studentAnswers.get(i).equals(correctAnswers.get(i))) {
                score++;
            }
        }
        return score;
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private boolean isEnrolled(Long studentId, Long courseId) {
        return enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId)
                .filter(e -> e.getStatus() == EnrollmentStatus.ACTIVE)
                .isPresent();
    }

    private ResponseStatusException bad(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

        private AssignmentResponse toResponse(Assignment a) {
        return new AssignmentResponse(
                a.getId(),
                a.getCourseId().getId(),
                a.getTitle(),
                a.getDescription(),
                a.getDueDate(),
                a.getTotalMarks(),
                a.getInstructionsOriginalName());
    }
}
    
