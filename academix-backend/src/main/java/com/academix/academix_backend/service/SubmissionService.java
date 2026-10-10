package com.academix.academix_backend.service;

import com.academix.academix_backend.dto.SubmissionFileResponse;
import com.academix.academix_backend.dto.SubmissionResponse;
import com.academix.academix_backend.model.Assignment;
import com.academix.academix_backend.model.Course;
import com.academix.academix_backend.model.CourseStatus;
import com.academix.academix_backend.model.EnrollmentStatus;
import com.academix.academix_backend.model.Submission;
import com.academix.academix_backend.model.SubmissionFile;
import com.academix.academix_backend.model.User;
import com.academix.academix_backend.repository.AssignmentRepository;
import com.academix.academix_backend.repository.EnrollmentRepository;
import com.academix.academix_backend.repository.SubmissionFileRepository;
import com.academix.academix_backend.repository.SubmissionRepository;
import com.academix.academix_backend.repository.UserRepository;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class SubmissionService {

    // A student can attach up to this many files to one submission
    static final int MAX_FILES = 5;

    private final SubmissionRepository submissionRepository;
    private final SubmissionFileRepository submissionFileRepository;
    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final FileStorageService fileStorageService;

    public SubmissionService(SubmissionRepository submissionRepository,
                             SubmissionFileRepository submissionFileRepository,
                             AssignmentRepository assignmentRepository,
                             UserRepository userRepository,
                             EnrollmentRepository enrollmentRepository,
                             FileStorageService fileStorageService) {
        this.submissionRepository = submissionRepository;
        this.submissionFileRepository = submissionFileRepository;
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.fileStorageService = fileStorageService;
    }


    // The student comes from the token; status and time are decided by the server
    // Submission with attached files (at least one file is required)
    public SubmissionResponse submitWithFiles(Long assignmentId, List<MultipartFile> files,
                                              String email) {
        Assignment assignment = findAssignment(assignmentId);
        User student = findUser(email);
        checkCanSubmit(assignment, student);

        List<MultipartFile> chosen = files == null
                ? List.of()
                : files.stream().filter(f -> f != null && !f.isEmpty()).toList();

        if (chosen.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Attach at least one file to submit");
        }
        if (chosen.size() > MAX_FILES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "You can attach at most " + MAX_FILES + " files");
        }

        String folder = folderFor(assignment.getId(), student.getId());
        List<FileStorageService.StoredFile> stored = new ArrayList<>();
        try {
            for (MultipartFile file : chosen) {
                stored.add(fileStorageService.store(file, folder));
            }

            Submission submission = newSubmission(assignment, student);
            for (FileStorageService.StoredFile s : stored) {
                SubmissionFile entry = new SubmissionFile();
                entry.setSubmission(submission);
                entry.setStoredName(s.storedName());
                entry.setOriginalName(s.originalName());
                entry.setContentType(s.contentType());
                entry.setSize(s.size());
                submission.getFiles().add(entry);
            }
            return toResponse(submissionRepository.save(submission));
        } catch (RuntimeException e) {
            // Do not leave orphan files on disk if anything failed
            for (FileStorageService.StoredFile s : stored) {
                fileStorageService.delete(folder, s.storedName());
            }
            throw e;
        }
    }

    // Admin: any assignment. Lecturer: only for their own courses.
    public List<SubmissionResponse> getSubmissionsForAssignment(Long assignmentId, String email, String role) {
        Assignment assignment = findAssignment(assignmentId);

        if (!"ADMIN".equals(role)) {
            User user = findUser(email);
            if (!user.getId().equals(assignment.getCourseId().getInstructorId())) {
                throw new AccessDeniedException("You can only view submissions of your own courses");
            }
        }
        return submissionRepository.findByAssignmentId(assignmentId).stream()
                .map(this::toResponse)
                .toList();
    }

    // Who may open a file: the student who submitted it, the lecturer of that course, or an admin
    public SubmissionFile getAuthorizedFile(Long fileId, String email, String role) {
        SubmissionFile file = submissionFileRepository.findById(fileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found"));
        Submission submission = file.getSubmission();

        if ("ADMIN".equals(role)) {
            return file;
        }
        User user = findUser(email);
        boolean isOwner = submission.getStudentId().getId().equals(user.getId());
        boolean isCourseLecturer = user.getId()
                .equals(submission.getAssignment().getCourseId().getInstructorId());
        if (!isOwner && !isCourseLecturer) {
            throw new AccessDeniedException("You do not have access to this file");
        }
        return file;
    }

    public Resource loadFile(SubmissionFile file) {
        Submission submission = file.getSubmission();
        String folder = folderFor(submission.getAssignment().getId(), submission.getStudentId().getId());
        return fileStorageService.load(folder, file.getStoredName());
    }


    public Submission submitAssignment(Submission submission) {
        Assignment assignment = submission.getAssignment();
        if (LocalDateTime.now().isAfter(assignment.getDueDate())) {
            submission.setStatus("LATE");
        } else {
            submission.setStatus("SUBMITTED");
        }
        submission.setSubmittedAt(LocalDateTime.now());
        return submissionRepository.save(submission);
    }

    public List<Submission> getSubmissionsByAssignment(Long assignmentId) {
        return submissionRepository.findByAssignmentId(assignmentId);
    }

    public List<Submission> getSubmissionsByStudent(Long studentId) {
        return submissionRepository.findByStudentId(studentId);
    }

    public Submission getSubmissionById(Long id) {
        Optional<Submission> result = submissionRepository.findById(id);
        if (result.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Submission not found with id: " + id);
        }
        return result.get();
    }

    public List<SubmissionResponse> getMySubmissions(String email) {
        User student = findUser(email);
        return submissionRepository.findByStudentId(student.getId()).stream()
                .map(this::toResponse)
                .toList();
    }


    private Assignment findAssignment(Long assignmentId) {
        return assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Assignment not found with id: " + assignmentId));
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    // Same rules as before: published course, active enrollment, one submission per student
    private void checkCanSubmit(Assignment assignment, User student) {
        Course course = assignment.getCourseId();

        if (course.getStatus() != CourseStatus.PUBLISHED || !isEnrolled(student.getId(), course.getId())) {
            throw new AccessDeniedException("You are not enrolled in this course");
        }

        boolean alreadySubmitted = submissionRepository.findByAssignmentId(assignment.getId()).stream()
                .anyMatch(s -> s.getStudentId().getId().equals(student.getId()));
        if (alreadySubmitted) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "You have already submitted this assignment");
        }
    }

    private Submission newSubmission(Assignment assignment, User student) {
        LocalDateTime now = LocalDateTime.now();
        Submission submission = new Submission();
        submission.setAssignment(assignment);
        submission.setStudentId(student);
        submission.setSubmittedAt(now);
        submission.setStatus(now.isAfter(assignment.getDueDate()) ? "LATE" : "SUBMITTED");
        return submission;
    }

    private String folderFor(Long assignmentId, Long studentId) {
        return "submissions/" + assignmentId + "/" + studentId;
    }

    private boolean isEnrolled(Long studentId, Long courseId) {
        return enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId)
                .filter(e -> e.getStatus() == EnrollmentStatus.ACTIVE)
                .isPresent();
    }

    private SubmissionResponse toResponse(Submission s) {
        User student = s.getStudentId();
        List<SubmissionFileResponse> files = s.getFiles().stream()
                .map(f -> new SubmissionFileResponse(f.getId(), f.getOriginalName(),
                        f.getContentType(), f.getSize()))
                .toList();
        return new SubmissionResponse(
                s.getId(),
                s.getAssignment().getId(),
                student.getId(),
                student.getFirstName() + " " + student.getLastName(),
                s.getFileUrl(),
                s.getSubmittedAt(),
                s.getStatus(),
                files);
    }
}
