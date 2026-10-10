package com.academix.academix_backend.service;

import com.academix.academix_backend.dto.CoursePerformanceResponse;
import com.academix.academix_backend.dto.CoursePerformanceResponse.AssignmentItem;
import com.academix.academix_backend.dto.CoursePerformanceResponse.QuizItem;
import com.academix.academix_backend.model.Assignment;
import com.academix.academix_backend.model.Course;
import com.academix.academix_backend.model.CourseStatus;
import com.academix.academix_backend.model.Enrollment;
import com.academix.academix_backend.model.EnrollmentStatus;
import com.academix.academix_backend.model.Grade;
import com.academix.academix_backend.model.Quiz;
import com.academix.academix_backend.model.QuizResult;
import com.academix.academix_backend.model.Submission;
import com.academix.academix_backend.model.User;
import com.academix.academix_backend.repository.AssignmentRepository;
import com.academix.academix_backend.repository.CourseRepository;
import com.academix.academix_backend.repository.EnrollmentRepository;
import com.academix.academix_backend.repository.GradeRepository;
import com.academix.academix_backend.repository.QuizRepository;
import com.academix.academix_backend.repository.QuizResultRepository;
import com.academix.academix_backend.repository.SubmissionRepository;
import com.academix.academix_backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PerformanceService {

    private static final double ASSIGNMENT_WEIGHT = 0.5;
    private static final double QUIZ_WEIGHT = 0.5;

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final GradeRepository gradeRepository;
    private final QuizRepository quizRepository;
    private final QuizResultRepository quizResultRepository;

    public PerformanceService(CourseRepository courseRepository,
                              UserRepository userRepository,
                              EnrollmentRepository enrollmentRepository,
                              AssignmentRepository assignmentRepository,
                              SubmissionRepository submissionRepository,
                              GradeRepository gradeRepository,
                              QuizRepository quizRepository,
                              QuizResultRepository quizResultRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
        this.gradeRepository = gradeRepository;
        this.quizRepository = quizRepository;
        this.quizResultRepository = quizResultRepository;
    }

    public List<CoursePerformanceResponse> getMyPerformance(String email) {
        User student = findUser(email);
        List<CoursePerformanceResponse> result = new ArrayList<>();

        for (Enrollment enrollment : enrollmentRepository.findByStudentId(student.getId())) {
            if (enrollment.getStatus() != EnrollmentStatus.ACTIVE) {
                continue;
            }
            Course course = courseRepository.findById(enrollment.getCourseId()).orElse(null);
            if (course == null || course.getStatus() != CourseStatus.PUBLISHED) {
                continue;
            }
            result.add(build(course, student));
        }
        return result;
    }

    public List<CoursePerformanceResponse> getCoursePerformance(Long courseId, String email, boolean isAdmin) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Course not found with id: " + courseId));

        if (!isAdmin) {
            User user = findUser(email);
            if (!user.getId().equals(course.getInstructorId())) {
                throw new AccessDeniedException("You can only view performance for your own courses");
            }
        }

        List<CoursePerformanceResponse> result = new ArrayList<>();
        for (Enrollment enrollment : enrollmentRepository.findByCourseId(courseId)) {
            if (enrollment.getStatus() != EnrollmentStatus.ACTIVE) {
                continue;
            }
            userRepository.findById(enrollment.getStudentId())
                    .ifPresent(student -> result.add(build(course, student)));
        }

        result.sort(Comparator.comparing(
                (CoursePerformanceResponse r) -> r.studentName() == null ? "" : r.studentName()));
        return result;
    }

    private CoursePerformanceResponse build(Course course, User student) {
        List<Assignment> assignments = assignmentRepository.findByCourse_Id(course.getId());
        List<Quiz> quizzes = quizRepository.findByCourseId(course.getId());

        Map<Long, Submission> submissionByAssignment = new HashMap<>();
        for (Submission submission : submissionRepository.findByStudentId(student.getId())) {
            submissionByAssignment.put(submission.getAssignment().getId(), submission);
        }

        Map<Long, Grade> gradeBySubmission = new HashMap<>();
        for (Grade grade : gradeRepository.findByStudentIdAndCourseId(student.getId(), course.getId())) {
            gradeBySubmission.put(grade.getSubmissionId(), grade);
        }

        Map<Long, QuizResult> resultByQuiz = new HashMap<>();
        for (QuizResult quizResult : quizResultRepository.findByStudentId(student.getId())) {
            resultByQuiz.put(quizResult.getQuizId(), quizResult);
        }

        int assignmentEarned = 0;
        int assignmentPossible = 0;
        int submittedCount = 0;
        List<AssignmentItem> assignmentItems = new ArrayList<>();

        for (Assignment assignment : assignments) {
            Submission submission = submissionByAssignment.get(assignment.getId());
            Grade grade = submission == null ? null : gradeBySubmission.get(submission.getId());

            String status;
            Integer marks = null;
            String feedback = null;
            LocalDateTime gradedAt = null;

            if (grade != null) {
                status = "GRADED";
                marks = grade.getMarksAwarded();
                feedback = grade.getFeedback();
                gradedAt = grade.getGradedAt();
                assignmentEarned += grade.getMarksAwarded();
                assignmentPossible += assignment.getTotalMarks();
            } else if (submission != null) {
                status = "SUBMITTED";
            } else {
                status = "NOT_SUBMITTED";
            }

            if (submission != null) {
                submittedCount++;
            }

            assignmentItems.add(new AssignmentItem(assignment.getId(), assignment.getTitle(),
                    status, marks, assignment.getTotalMarks(), feedback, gradedAt));
        }

        int quizEarned = 0;
        int quizPossible = 0;
        int quizzesTaken = 0;
        List<QuizItem> quizItems = new ArrayList<>();

        for (Quiz quiz : quizzes) {
            QuizResult quizResult = resultByQuiz.get(quiz.getId());
            if (quizResult != null) {
                quizzesTaken++;
                quizEarned += quizResult.getScore();
                quizPossible += quizResult.getTotalMarks();
                quizItems.add(new QuizItem(quiz.getId(), quiz.getTitle(), "TAKEN",
                        quizResult.getScore(), quizResult.getTotalMarks()));
            } else {
                quizItems.add(new QuizItem(quiz.getId(), quiz.getTitle(), "NOT_TAKEN",
                        null, quiz.getTotalMarks()));
            }
        }

        Double assignmentPercent = percent(assignmentEarned, assignmentPossible);
        Double quizPercent = percent(quizEarned, quizPossible);

        Double overall;
        if (assignmentPercent != null && quizPercent != null) {
            overall = round(ASSIGNMENT_WEIGHT * assignmentPercent + QUIZ_WEIGHT * quizPercent);
        } else if (assignmentPercent != null) {
            overall = assignmentPercent;
        } else {
            overall = quizPercent;
        }

        int totalItems = assignments.size() + quizzes.size();
        int completedItems = submittedCount + quizzesTaken;
        Double progress = totalItems == 0 ? 0.0 : round(completedItems * 100.0 / totalItems);

        return new CoursePerformanceResponse(
                course.getId(),
                course.getTitle(),
                student.getId(),
                student.getFirstName() + " " + student.getLastName(),
                student.getEmail(),
                assignmentPercent,
                quizPercent,
                overall,
                progress,
                completedItems,
                totalItems,
                assignmentItems,
                quizItems);
    }

    private Double percent(int earned, int possible) {
        if (possible <= 0) {
            return null;
        }
        return round(earned * 100.0 / possible);
    }

    private Double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}