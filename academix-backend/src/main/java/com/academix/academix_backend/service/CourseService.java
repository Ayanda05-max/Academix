package com.academix.academix_backend.service;

import com.academix.academix_backend.model.Assignment;
import com.academix.academix_backend.model.Course;
import com.academix.academix_backend.model.CourseStatus;
import com.academix.academix_backend.model.Enrollment;
import com.academix.academix_backend.model.Quiz;
import com.academix.academix_backend.model.Submission;
import com.academix.academix_backend.model.SubmissionFile;
import com.academix.academix_backend.model.User;
import com.academix.academix_backend.repository.AssignmentRepository;
import com.academix.academix_backend.repository.CourseRepository;
import com.academix.academix_backend.repository.EnrollmentRepository;
import com.academix.academix_backend.repository.GradeRepository;
import com.academix.academix_backend.repository.QuizRepository;
import com.academix.academix_backend.repository.QuizResultRepository;
import com.academix.academix_backend.repository.SubmissionRepository;
import com.academix.academix_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuizResultRepository quizResultRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private GradeRepository gradeRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    public CourseService(CourseRepository courseRepository, UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    public List<Course> getVisibleCourses(boolean isStaff) {
        return isStaff ? courseRepository.findAll()
                       : courseRepository.findByStatus(CourseStatus.PUBLISHED);
    }

    public Optional<Course> getVisibleCourse(Long id, boolean isStaff) {
        return courseRepository.findById(id)
                .filter(c -> isStaff || c.getStatus() == CourseStatus.PUBLISHED);
    }

    public Course createCourse(Course course, String email, boolean isAdmin) {
        User creator = findUser(email);
        Long instructorId = (isAdmin && course.getInstructorId() != null)
                ? course.getInstructorId() : creator.getId();
        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Instructor not found with id: " + instructorId));

        course.setId(null);
        course.setStatus(CourseStatus.DRAFT);
        course.setLessons(new ArrayList<>());
        course.setInstructorId(instructor.getId());
        course.setInstructorName(instructor.getFirstName() + " " + instructor.getLastName());
        return courseRepository.save(course);
    }

    public Course updateCourse(Long id, Course updated, String email, boolean isAdmin) {
        Course existing = findCourse(id);
        checkCanModify(existing, email, isAdmin);

        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setCategory(updated.getCategory());

        if (isAdmin && updated.getInstructorId() != null) {
            User instructor = userRepository.findById(updated.getInstructorId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Instructor not found with id: " + updated.getInstructorId()));
            existing.setInstructorId(instructor.getId());
            existing.setInstructorName(instructor.getFirstName() + " " + instructor.getLastName());
        }
        existing.setUpdatedAt(LocalDateTime.now());
        return courseRepository.save(existing);
    }

    @Transactional
    public Course assignInstructor(Long courseId, Long instructorId) {
        Course course = findCourse(courseId);

        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Lecturer not found with id: " + instructorId));

        if (!"LECTURER".equals(instructor.getRole())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "The selected user is not a lecturer");
        }

        course.setInstructorId(instructor.getId());
        course.setInstructorName(instructor.getFirstName() + " " + instructor.getLastName());
        course.setUpdatedAt(LocalDateTime.now());
        return courseRepository.save(course);
    }

    @Transactional
    public Course publishCourse(Long id, String email, boolean isAdmin) {
        Course course = findCourse(id);
        checkCanModify(course, email, isAdmin);

        if (course.getLessons() == null || course.getLessons().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Add at least one lesson before publishing this course");
        }
        course.setStatus(CourseStatus.PUBLISHED);
        course.setUpdatedAt(LocalDateTime.now());
        return courseRepository.save(course);
    }

    @Transactional
    public void deleteCourse(Long id, boolean force) {
        Course course = findCourse(id);

        List<Assignment> assignments = assignmentRepository.findByCourse_Id(id);
        List<Quiz> quizzes = quizRepository.findByCourseId(id);
        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(id);

        if (!force && (!assignments.isEmpty() || !quizzes.isEmpty() || !enrollments.isEmpty())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    describeContents(enrollments.size(), assignments.size(), quizzes.size()));
        }

        List<String[]> filesOnDisk = new ArrayList<>();

        for (Assignment assignment : assignments) {
            List<Submission> submissions = submissionRepository.findByAssignmentId(assignment.getId());
            for (Submission submission : submissions) {
                String folder = "submissions/" + assignment.getId() + "/"
                        + submission.getStudentId().getId();
                for (SubmissionFile file : submission.getFiles()) {
                    filesOnDisk.add(new String[] {folder, file.getStoredName()});
                }
            }
            submissionRepository.deleteAll(submissions);
        }
        submissionRepository.flush();

        gradeRepository.deleteAll(gradeRepository.findByCourseId(id));
        assignmentRepository.deleteAll(assignments);
        assignmentRepository.flush();

        for (Quiz quiz : quizzes) {
            quizResultRepository.deleteAll(quizResultRepository.findByQuizId(quiz.getId()));
        }
        quizRepository.deleteAll(quizzes);
        quizRepository.flush();

        enrollmentRepository.deleteAll(enrollments);

        try {
            courseRepository.delete(course);
            courseRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "This course is still linked to other records and cannot be deleted");
        }

        if (!filesOnDisk.isEmpty()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    for (String[] file : filesOnDisk) {
                        try {
                            fileStorageService.delete(file[0], file[1]);
                        } catch (RuntimeException ignored) {
                        }
                    }
                }
            });
        }
    }

    private String describeContents(int students, int assignments, int quizzes) {
        List<String> parts = new ArrayList<>();
        if (students > 0) parts.add(students + (students == 1 ? " enrolled student" : " enrolled students"));
        if (assignments > 0) parts.add(assignments + (assignments == 1 ? " assignment" : " assignments"));
        if (quizzes > 0) parts.add(quizzes + (quizzes == 1 ? " quiz" : " quizzes"));

        String joined = parts.size() == 1
                ? parts.get(0)
                : String.join(", ", parts.subList(0, parts.size() - 1))
                        + " and " + parts.get(parts.size() - 1);
        return "This course has " + joined + ".";
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

    private void checkCanModify(Course course, String email, boolean isAdmin) {
        if (isAdmin) return;
        User user = findUser(email);
        if (!user.getId().equals(course.getInstructorId())) {
            throw new AccessDeniedException("You can only modify your own courses");
        }
    }
}