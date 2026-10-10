package com.academix.academix_backend.service;

import com.academix.academix_backend.model.Assignment;
import com.academix.academix_backend.model.Course;
import com.academix.academix_backend.model.CourseStatus;
import com.academix.academix_backend.model.EnrollmentStatus;
import com.academix.academix_backend.model.User;
import com.academix.academix_backend.repository.AssignmentRepository;
import com.academix.academix_backend.repository.EnrollmentRepository;
import com.academix.academix_backend.repository.UserRepository;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Service
public class AssignmentInstructionsService {

    private static final long MAX_SIZE = 10L * 1024 * 1024; // 10 MB

    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final FileStorageService fileStorageService;

    public AssignmentInstructionsService(AssignmentRepository assignmentRepository,
                                         UserRepository userRepository,
                                         EnrollmentRepository enrollmentRepository,
                                         FileStorageService fileStorageService) {
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.fileStorageService = fileStorageService;
    }

    // Lecturer (own course) or admin attaches or replaces the instructions PDF
    public void upload(Long assignmentId, MultipartFile file, String email, boolean isAdmin) {
        Assignment assignment = findAssignment(assignmentId);

        if (!isAdmin) {
            User user = findUser(email);
            if (!user.getId().equals(assignment.getCourseId().getInstructorId())) {
                throw new AccessDeniedException("You can only attach instructions to your own assignments");
            }
        }

        if (file == null || file.isEmpty()) {
            throw bad("Choose a PDF file to attach");
        }
        if (file.getSize() > MAX_SIZE) {
            throw bad("The PDF must be 10 MB or smaller");
        }
        if (!looksLikePdf(file)) {
            throw bad("Only PDF files can be attached");
        }

        String folder = folderFor(assignmentId);
        FileStorageService.StoredFile stored = fileStorageService.store(file, folder);

        String oldStoredName = assignment.getInstructionsStoredName();
        assignment.setInstructionsStoredName(stored.storedName());
        assignment.setInstructionsOriginalName(stored.originalName());
        try {
            assignmentRepository.save(assignment);
        } catch (RuntimeException e) {
            fileStorageService.delete(folder, stored.storedName());
            throw e;
        }

        // Remove the replaced file only after the new one is saved
        if (oldStoredName != null) {
            fileStorageService.delete(folder, oldStoredName);
        }
    }

    // Admin; the lecturer of the course; students actively enrolled in a published course
    public Assignment getAuthorized(Long assignmentId, String email, String role) {
        Assignment assignment = findAssignment(assignmentId);
        if (assignment.getInstructionsStoredName() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "This assignment has no instructions file");
        }
        if ("ADMIN".equals(role)) {
            return assignment;
        }

        User user = findUser(email);
        Course course = assignment.getCourseId();

        if ("LECTURER".equals(role)) {
            if (!user.getId().equals(course.getInstructorId())) {
                throw new AccessDeniedException("You do not have access to this file");
            }
            return assignment;
        }

        boolean enrolled = enrollmentRepository.findByStudentIdAndCourseId(user.getId(), course.getId())
                .filter(e -> e.getStatus() == EnrollmentStatus.ACTIVE)
                .isPresent();
        if (course.getStatus() != CourseStatus.PUBLISHED || !enrolled) {
            throw new AccessDeniedException("You are not enrolled in this course");
        }
        return assignment;
    }

    public Resource load(Assignment assignment) {
        return fileStorageService.load(folderFor(assignment.getId()), assignment.getInstructionsStoredName());
    }

    // Check the real file header (%PDF), not just the name the browser sent
    private boolean looksLikePdf(MultipartFile file) {
        try (InputStream in = file.getInputStream()) {
            byte[] head = in.readNBytes(4);
            return head.length == 4 && new String(head, StandardCharsets.US_ASCII).equals("%PDF");
        } catch (IOException e) {
            return false;
        }
    }

    private String folderFor(Long assignmentId) {
        return "assignments/" + assignmentId + "/instructions";
    }

    private Assignment findAssignment(Long id) {
        return assignmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Assignment not found with id: " + id));
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private ResponseStatusException bad(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}