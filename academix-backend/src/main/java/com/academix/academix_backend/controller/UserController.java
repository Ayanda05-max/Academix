package com.academix.academix_backend.controller;

import com.academix.academix_backend.dto.RegisterRequest;
import com.academix.academix_backend.dto.UserResponse;
import com.academix.academix_backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    private boolean isAdmin(Authentication auth) {
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ADMIN"));
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userService.listUsers();
    }

    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable Long id, Authentication auth) {
        return userService.getUser(id, auth.getName(), isAdmin(auth));
    }

    @PutMapping("/{id}")
    public UserResponse updateUser(@PathVariable Long id,
                                   @RequestBody RegisterRequest request,
                                   Authentication auth) {
        return userService.updateUser(id, request.getFirstName(), request.getLastName(),
                request.getEmail(), auth.getName(), isAdmin(auth));
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id,
                           @RequestParam(defaultValue = "false") boolean force,
                           Authentication auth) {
        userService.deleteUser(id, auth.getName(), force);
    }
}