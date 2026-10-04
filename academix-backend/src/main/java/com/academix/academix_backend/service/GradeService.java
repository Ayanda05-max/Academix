package com.academix.academix_backend.service;

import com.academix.academix_backend.dto.GradeRequest;
import com.academix.academix_backend.dto.GradeResponse;
import com.academix.academix_backend.model.Assignment;
import com.academix.academix_backend.model.Course;
import com.academix.academix_backend.model.Grade;
import com.academix.academix_backend.model.Submission;
import com.academix.academix_backend.model.User;
import com.academix.academix_backend.repository.CourseRepository;
import com.academix.academix_backend.repository.GradeRepository;
import com.academix.academix_backend.repository.SubmissionRepository;
import com.academix.academix_backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class GradeService {

    private static final Logger log = LoggerFactory.getLogger(GradeService.class);

    private final GradeRepository gradeRepository;
    private final SubmissionRepository submissionRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Autowired
    public GradeService(GradeRepository gradeRepository,
                        SubmissionRepository submissionRepository,
                        CourseRepository courseRepository,
                        UserRepository userRepository,
                        NotificationService notificationService) {
        this.gradeRepository = gradeRepository;
        this.submissionRepository = submissionRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    

    
    public GradeResponse recordGrade(GradeRequest request, String email, boolean isAdmin) {
        if (request.getSubmissionId() == null) throw bad("submissionId is required");
        if (request.getMarksAwarded() == null) throw bad("marksAwarded is required");

        Submission submission = submissionRepository.findById(request.getSubmissionId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Submission not found with id: " + request.getSubmissionId()));
        Assignment assignment = submission.getAssignment();
        Long courseId = assignment.getCourseId().getId();

        checkCanGrade(courseId, email, isAdmin);
        validateMarks(request.getMarksAwarded(), assignment.getTotalMarks());

        boolean alreadyGraded = gradeRepository.findByCourseId(courseId).stream()
                .anyMatch(g -> g.getSubmissionId().equals(submission.getId()));
        if (alreadyGraded) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This submission has already been graded. Use PUT to change the grade");
        }

        Grade grade = new Grade();
        grade.setSubmissionId(submission.getId());
        grade.setStudentId(submission.getStudentId().getId());
        grade.setCourseId(courseId);
        grade.setMarksAwarded(request.getMarksAwarded());
        grade.setFeedback(request.getFeedback());
        grade.setGradedAt(LocalDateTime.now());
        Grade saved = gradeRepository.save(grade);

        submission.setStatus("GRADED");
        submissionRepository.save(submission);


        try {
            notificationService.notifyGradeReleased(saved.getStudentId(), saved.getCourseId());
        } catch (Exception e) {
            log.warn("Grade saved but notification failed: {}", e.getMessage());
        }
        return mapToResponse(saved);
    }

   

    @Transactional
    public GradeResponse updateGrade(Long id, GradeRequest request, String email, boolean isAdmin) {
        Grade grade = gradeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Grade not found with id: " + id));
        checkCanGrade(grade.getCourseId(), email, isAdmin);

        if (request.getMarksAwarded() != null) {
            Submission submission = submissionRepository.findById(grade.getSubmissionId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Submission not found"));
            validateMarks(request.getMarksAwarded(), submission.getAssignment().getTotalMarks());
            grade.setMarksAwarded(request.getMarksAwarded());
        }
        if (request.getFeedback() != null) {
            grade.setFeedback(request.getFeedback());
        }
        return mapToResponse(gradeRepository.save(grade));
    }



    public List<GradeResponse> getGradesByStudent(Long studentId, String email, String role) {
        if (!"ADMIN".equals(role)) {
            User user = findUser(email);
            if (!"STUDENT".equals(role) || !user.getId().equals(studentId)) {
                throw new AccessDeniedException("You can only view your own grades");
            }
        }
        return gradeRepository.findByStudentId(studentId).stream()
                .map(this::mapToResponse).toList();
    }

    public List<GradeResponse> getGradesByCourse(Long courseId, String email, boolean isAdmin) {
        checkCanGrade(courseId, email, isAdmin);
        return gradeRepository.findByCourseId(courseId).stream()
                .map(this::mapToResponse).toList();
    }

    public Double getAverageForCourse(Long courseId, String email, boolean isAdmin) {
        checkCanGrade(courseId, email, isAdmin);
        return getAverageForCourse(courseId);
    }


    public Double getAverageForCourse(Long courseId) {
        List<Grade> grades = gradeRepository.findByCourseId(courseId);
        if (grades.isEmpty()) {
            return null;
        }
        double sum = 0;
        for (Grade grade : grades) {
            sum += grade.getMarksAwarded();
        }
        return sum / grades.size();
    }


    private void checkCanGrade(Long courseId, String email, boolean isAdmin) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Course not found with id: " + courseId));
        if (isAdmin) return;
        User user = findUser(email);
        if (!user.getId().equals(course.getInstructorId())) {
            throw new AccessDeniedException("You can only manage grades of your own courses");
        }
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private void validateMarks(Integer marksAwarded, Number totalMarks) {
        if (marksAwarded == null || marksAwarded < 0) {
            throw bad("Marks awarded cannot be negative");
        }
        if (totalMarks != null && marksAwarded > totalMarks.doubleValue()) {
            throw bad("Marks awarded cannot exceed the total marks (" + totalMarks + ") for this assignment");
        }
    }

    private ResponseStatusException bad(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

       private GradeResponse mapToResponse(Grade grade) {
        GradeResponse response = new GradeResponse();
        response.setId(grade.getId());
        response.setSubmissionId(grade.getSubmissionId());
        response.setStudentId(grade.getStudentId());
        response.setCourseId(grade.getCourseId());
        response.setMarksAwarded(grade.getMarksAwarded());
        response.setFeedback(grade.getFeedback());
        response.setGradedAt(grade.getGradedAt());

        submissionRepository.findById(grade.getSubmissionId()).ifPresent(submission -> {
            Assignment assignment = submission.getAssignment();
            response.setAssignmentId(assignment.getId());
            response.setAssignmentTitle(assignment.getTitle());
            response.setTotalMarks(assignment.getTotalMarks());
        });
        userRepository.findById(grade.getStudentId()).ifPresent(user ->
                response.setStudentName(user.getFirstName() + " " + user.getLastName()));
        return response;
    }
}