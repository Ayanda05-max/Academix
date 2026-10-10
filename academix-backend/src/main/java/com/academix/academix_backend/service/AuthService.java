package com.academix.academix_backend.service;

import com.academix.academix_backend.dto.LoginResponse;
import com.academix.academix_backend.model.User;
import com.academix.academix_backend.repository.UserRepository;
import com.academix.academix_backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Set;

@Service
public class AuthService {

    private static final Set<String> ROLES = Set.of("STUDENT", "LECTURER", "ADMIN");

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;


    @Transactional
    public User register(String firstName, String lastName, String email, String password, String role) {
        if (isBlank(firstName)) throw bad("First name is required");
        if (isBlank(lastName)) throw bad("Last name is required");
        if (isBlank(email) || !email.contains("@")) throw bad("A valid email is required");
        if (password == null || password.length() < 8) throw bad("Password must be at least 8 characters");

        String cleanRole = role == null ? "" : role.trim().toUpperCase();
        if (!ROLES.contains(cleanRole)) throw bad("Role must be STUDENT, LECTURER or ADMIN");

        String cleanEmail = email.trim();
        if (userRepository.existsByEmail(cleanEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        User newUser = new User();
        newUser.setFirstName(firstName.trim());
        newUser.setLastName(lastName.trim());
        newUser.setEmail(cleanEmail);
        newUser.setPassword(passwordEncoder.encode(password));
        newUser.setRole(cleanRole);
        return userRepository.save(newUser);
    }

    public LoginResponse loginWithDetails(String email, String password) {
        if (isBlank(email) || password == null) throw invalidLogin();

        User user = userRepository.findByEmail(email.trim()).orElseThrow(this::invalidLogin);
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw invalidLogin();
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return new LoginResponse(token, user.getId(), user.getFirstName(),
                user.getLastName(), user.getEmail(), user.getRole());
    }

    
    public String login(String email, String password) {
        return loginWithDetails(email, password).token();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private ResponseStatusException bad(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

   
    private ResponseStatusException invalidLogin() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email or password is incorrect");
    }
}