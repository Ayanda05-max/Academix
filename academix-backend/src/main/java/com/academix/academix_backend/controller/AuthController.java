package com.academix.academix_backend.controller;

import com.academix.academix_backend.dto.LoginRequest;
import com.academix.academix_backend.dto.LoginResponse;
import com.academix.academix_backend.dto.RegisterRequest;
import com.academix.academix_backend.dto.UserResponse;
import com.academix.academix_backend.model.User;
import com.academix.academix_backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/register")
    public UserResponse register(@RequestBody RegisterRequest request) {
        User user = authService.register(
            request.getFirstName(),
            request.getLastName(),
            request.getEmail(),
            request.getPassword(),
            request.getRole()
        );
        return new UserResponse(
            user.getId(),
            user.getFirstName(),
            user.getLastName(),
            user.getEmail(),
            user.getRole(),
            user.getCreatedAt()
        );
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return authService.loginWithDetails(request.getEmail(), request.getPassword());
    }
}