package com.academix.academix_backend.service;

import com.academix.academix_backend.dto.QuizAttemptResponse;
import com.academix.academix_backend.dto.QuizCreateRequest;
import com.academix.academix_backend.dto.QuizResponse;
import com.academix.academix_backend.dto.QuizScoreResponse;
import com.academix.academix_backend.dto.QuizSubmitRequest;
import com.academix.academix_backend.model.Course;
import com.academix.academix_backend.model.CourseStatus;
import com.academix.academix_backend.model.EnrollmentStatus;
import com.academix.academix_backend.model.Quiz;
import com.academix.academix_backend.model.QuizResult;
import com.academix.academix_backend.model.User;
import com.academix.academix_backend.repository.CourseRepository;
import com.academix.academix_backend.repository.EnrollmentRepository;
import com.academix.academix_backend.repository.QuizRepository;
import com.academix.academix_backend.repository.QuizResultRepository;
import com.academix.academix_backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class QuizService {

    private static final Logger log = LoggerFactory.getLogger(QuizService.class);

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final TypeReference<List<Map<String, Object>>> QUESTION_LIST =
            new TypeReference<>() {};
    private static final TypeReference<List<Integer>> ANSWER_LIST =
            new TypeReference<>() {};

    private final QuizRepository quizRepository;
    private final QuizResultRepository quizResultRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final NotificationService notificationService;

    @Autowired
    public QuizService(QuizRepository quizRepository,
                       QuizResultRepository quizResultRepository,
                       CourseRepository courseRepository,
                       UserRepository userRepository,
                       EnrollmentRepository enrollmentRepository,
                       NotificationService notificationService) {
        this.quizRepository = quizRepository;
        this.quizResultRepository = quizResultRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.notificationService = notificationService;
    }

    public QuizResponse createQuiz(QuizCreateRequest request, String email, boolean isAdmin) {
        if (request.getCourseId() == null) throw bad("courseId is required");
        if (request.getTitle() == null || request.getTitle().isBlank()) throw bad("title is required");
        if (request.getTimeLimit() != null && request.getTimeLimit() <= 0) {
            throw bad("timeLimit must be greater than 0");
        }
        if (request.getQuestions() == null || request.getQuestions().isEmpty()) {
            throw bad("At least one question is required");
        }

        Course course = findCourse(request.getCourseId());
        if (!isAdmin) {
            User user = findUser(email);
            if (!user.getId().equals(course.getInstructorId())) {
                throw new AccessDeniedException("You can only add quizzes to your own courses");
            }
        }

        List<Map<String, Object>> stored = new ArrayList<>();
        int total = 0;
        int number = 1;
        for (QuizCreateRequest.Question q : request.getQuestions()) {
            if (q.getText() == null || q.getText().isBlank()) {
                throw bad("Question " + number + " needs text");
            }
            List<String> options = q.getOptions();
            if (options == null || options.size() < 2) {
                throw bad("Question " + number + " needs at least 2 options");
            }
            for (String option : options) {
                if (option == null || option.isBlank()) {
                    throw bad("Question " + number + " has an empty option");
                }
            }
            Integer correct = q.getCorrectIndex();
            if (correct == null || correct < 0 || correct >= options.size()) {
                throw bad("Question " + number + " has an invalid correctIndex");
            }
            int marks = q.getMarks() == null ? 1 : q.getMarks();
            if (marks <= 0) throw bad("Question " + number + " marks must be greater than 0");

            Map<String, Object> map = new LinkedHashMap<>();
            map.put("text", q.getText().trim());
            map.put("options", options);
            map.put("correctIndex", correct);
            map.put("marks", marks);
            stored.add(map);
            total += marks;
            number++;
        }

        Quiz quiz = new Quiz();
        quiz.setCourse(course);
        quiz.setTitle(request.getTitle().trim());
        quiz.setTimeLimit(request.getTimeLimit());
        quiz.setTotalMarks(total);
        quiz.setQuestions(toJson(stored));

        Quiz saved = quizRepository.save(quiz);

        try {
            notificationService.notifyNewQuiz(course.getId(), course.getTitle(), saved.getTitle());
        } catch (Exception e) {
            log.warn("Quiz saved but notification failed: {}", e.getMessage());
        }
        return toResponse(saved, true);
    }

    public List<QuizResponse> getQuizzesForCourse(Long courseId, String email, String role) {
        Course course = findCourse(courseId);
        User user = findUser(email);
        boolean staff = "ADMIN".equals(role) || "LECTURER".equals(role);

        if ("LECTURER".equals(role)) {
            if (!user.getId().equals(course.getInstructorId())) {
                throw new AccessDeniedException("You can only view quizzes of your own courses");
            }
        } else if (!"ADMIN".equals(role)) {
            if (!isEnrolled(user.getId(), course)) {
                throw new AccessDeniedException("You are not enrolled in this course");
            }
        }
        return quizRepository.findByCourseId(courseId).stream()
                .map(q -> toResponse(q, staff))
                .toList();
    }

    public QuizScoreResponse submit(Long quizId, QuizSubmitRequest request, String email) {
        Quiz quiz = findQuiz(quizId);
        User student = findUser(email);
        Course course = quiz.getCourse();

        if (!isEnrolled(student.getId(), course)) {
            throw new AccessDeniedException("You are not enrolled in this course");
        }

        List<Map<String, Object>> questions = parseQuestions(quiz.getQuestions());
        List<Integer> answers = request.getAnswers();
        if (answers == null || answers.size() != questions.size()) {
            throw bad("Provide exactly " + questions.size() + " answers, one per question");
        }

        if (quizResultRepository.findByQuizIdAndStudentId(quizId, student.getId()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "You have already submitted this quiz");
        }

        int score = 0;
        for (int i = 0; i < questions.size(); i++) {
            Map<String, Object> question = questions.get(i);
            int correct = ((Number) question.get("correctIndex")).intValue();
            int marks = ((Number) question.get("marks")).intValue();
            Integer chosen = answers.get(i);
            if (chosen != null && chosen == correct) {
                score += marks;
            }
        }

        QuizResult result = new QuizResult();
        result.setQuizId(quizId);
        result.setStudentId(student.getId());
        result.setScore(score);
        result.setTotalMarks(quiz.getTotalMarks());
        result.setSubmittedAt(LocalDateTime.now());
        result.setAnswers(toJson(answers));
        return toScore(quizResultRepository.save(result));
    }

    public QuizScoreResponse getResult(Long quizId, Long studentId, String email, String role) {
        Quiz quiz = findQuiz(quizId);
        User user = findUser(email);

        if ("LECTURER".equals(role)) {
            if (!user.getId().equals(quiz.getCourse().getInstructorId())) {
                throw new AccessDeniedException("You can only view results of your own courses");
            }
        } else if (!"ADMIN".equals(role)) {
            if (!user.getId().equals(studentId)) {
                throw new AccessDeniedException("You can only view your own results");
            }
        }
        QuizResult result = quizResultRepository.findByQuizIdAndStudentId(quizId, studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No result found for this student on this quiz"));
        return toScore(result);
    }

    public List<QuizAttemptResponse> getAttempts(Long quizId, String email, String role) {
        Quiz quiz = findQuiz(quizId);
        User user = findUser(email);

        if ("LECTURER".equals(role) && !user.getId().equals(quiz.getCourse().getInstructorId())) {
            throw new AccessDeniedException("You can only view submissions of your own courses");
        }

        return quizResultRepository.findByQuizId(quizId).stream().map(r -> {
            User student = userRepository.findById(r.getStudentId()).orElse(null);
            double percentage = r.getTotalMarks() == 0
                    ? 0.0
                    : Math.round(r.getScore() * 1000.0 / r.getTotalMarks()) / 10.0;
            return new QuizAttemptResponse(
                    r.getId(),
                    r.getStudentId(),
                    student == null ? null : student.getFirstName() + " " + student.getLastName(),
                    student == null ? null : student.getEmail(),
                    r.getScore(),
                    r.getTotalMarks(),
                    percentage,
                    r.getSubmittedAt(),
                    parseAnswers(r.getAnswers()));
        }).toList();
    }

    private Quiz findQuiz(Long id) {
        return quizRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Quiz not found with id: " + id));
    }

    private Course findCourse(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Course not found with id: " + id));
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                        "User not found"));
    }

    private boolean isEnrolled(Long studentId, Course course) {
        return course.getStatus() == CourseStatus.PUBLISHED
                && enrollmentRepository.findByStudentIdAndCourseId(studentId, course.getId())
                        .filter(e -> e.getStatus() == EnrollmentStatus.ACTIVE)
                        .isPresent();
    }

    private ResponseStatusException bad(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private String toJson(Object value) {
        try {
            return MAPPER.writeValueAsString(value);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Could not save the data");
        }
    }

    private List<Map<String, Object>> parseQuestions(String json) {
        try {
            return MAPPER.readValue(json, QUESTION_LIST);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "This quiz has invalid question data");
        }
    }

    private List<Integer> parseAnswers(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            return MAPPER.readValue(json, ANSWER_LIST);
        } catch (Exception e) {
            return null;
        }
    }

    private QuizResponse toResponse(Quiz quiz, boolean includeAnswers) {
        List<Map<String, Object>> questions = parseQuestions(quiz.getQuestions());
        if (!includeAnswers) {
            for (Map<String, Object> question : questions) {
                question.remove("correctIndex");
            }
        }
        return new QuizResponse(quiz.getId(), quiz.getCourse().getId(), quiz.getTitle(),
                questions, quiz.getTimeLimit(), quiz.getTotalMarks());
    }

    private QuizScoreResponse toScore(QuizResult r) {
        double percentage = r.getTotalMarks() == 0
                ? 0.0
                : Math.round(r.getScore() * 1000.0 / r.getTotalMarks()) / 10.0;
        return new QuizScoreResponse(r.getId(), r.getQuizId(), r.getStudentId(),
                r.getScore(), r.getTotalMarks(), percentage, r.getSubmittedAt());
    }
}