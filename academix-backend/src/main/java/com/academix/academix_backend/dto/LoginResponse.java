package com.academix.academix_backend.dto;

public record LoginResponse(
        String token,
        Long id,
        String firstName,
        String lastName,
        String email,
        String role
) {}