package com.academix.academix_backend.service;

import com.academix.academix_backend.dto.UserResponse;
import com.academix.academix_backend.model.User;
import com.academix.academix_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

  

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

    public void deleteUser(Long id, String callerEmail) {
        User caller = findByEmail(callerEmail);
        if (caller.getId().equals(id)) {
            throw bad("You cannot delete your own account");
        }
        User user = getUserById(id);
        try {
            userRepository.delete(user);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This user has submissions and cannot be deleted");
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