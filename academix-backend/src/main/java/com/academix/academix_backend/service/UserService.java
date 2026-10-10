package com.academix.academix_backend.service;

import com.academix.academix_backend.dto.UserResponse;
import com.academix.academix_backend.model.Submission;
import com.academix.academix_backend.model.SubmissionFile;
import com.academix.academix_backend.model.User;
import com.academix.academix_backend.repository.EnrollmentRepository;
import com.academix.academix_backend.repository.GradeRepository;
import com.academix.academix_backend.repository.NotificationRepository;
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

import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private GradeRepository gradeRepository;

    @Autowired
    private QuizResultRepository quizResultRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private FileStorageService fileStorageService;

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<UserResponse> listUsers() {
        return userRepository.findAll().stream().map(this::toResponse).toList();
    }

    public UserResponse getUser(Long id, String callerEmail, boolean isAdmin) {
        checkSelfOrAdmin(id, callerEmail, isAdmin);
        return toResponse(getUserById(id));
    }

    public UserResponse updateUser(Long id, String firstName, String lastName, String email,
                                   String callerEmail, boolean isAdmin) {
        checkSelfOrAdmin(id, callerEmail, isAdmin);
        User user = getUserById(id);

        if (firstName == null || firstName.isBlank()) throw bad("firstName is required");
        if (lastName == null || lastName.isBlank()) throw bad("lastName is required");
        if (email == null || email.isBlank() || !email.contains("@")) throw bad("A valid email is required");

        String newEmail = email.trim();
        userRepository.findByEmail(newEmail).ifPresent(other -> {
            if (!other.getId().equals(id)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "That email address is already in use");
            }
        });

        user.setFirstName(firstName.trim());
        user.setLastName(lastName.trim());
        user.setEmail(newEmail);
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id, String callerEmail, boolean force) {
        User caller = findByEmail(callerEmail);
        if (caller.getId().equals(id)) {
            throw bad("You cannot delete your own account");
        }

        User user = getUserById(id);
        List<Submission> submissions = submissionRepository.findByStudentId(id);

        if (!submissions.isEmpty() && !force) {
            int count = submissions.size();
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This user has " + count + (count == 1 ? " submission." : " submissions."));
        }

        removeUserData(id, submissions);

        try {
            userRepository.delete(user);
            userRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw bad("This user is still linked to other records and cannot be deleted");
        }
    }

    private void removeUserData(Long userId, List<Submission> submissions) {
        List<String[]> filesOnDisk = new ArrayList<>();
        for (Submission submission : submissions) {
            String folder = "submissions/" + submission.getAssignment().getId() + "/" + userId;
            for (SubmissionFile file : submission.getFiles()) {
                filesOnDisk.add(new String[] {folder, file.getStoredName()});
            }
        }

        gradeRepository.deleteAll(gradeRepository.findByStudentId(userId));
        quizResultRepository.deleteAll(quizResultRepository.findByStudentId(userId));
        submissionRepository.deleteAll(submissions);
        enrollmentRepository.deleteAll(enrollmentRepository.findByStudentId(userId));
        notificationRepository.deleteAll(
                notificationRepository.findByUserIdOrderByCreatedAtDesc(userId));

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

    private void checkSelfOrAdmin(Long id, String callerEmail, boolean isAdmin) {
        if (isAdmin) return;
        User caller = findByEmail(callerEmail);
        if (!caller.getId().equals(id)) {
            throw new AccessDeniedException("You can only access your own profile");
        }
    }

    private User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private ResponseStatusException bad(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private UserResponse toResponse(User u) {
        return new UserResponse(u.getId(), u.getFirstName(), u.getLastName(),
                u.getEmail(), u.getRole(), u.getCreatedAt());
    }
}