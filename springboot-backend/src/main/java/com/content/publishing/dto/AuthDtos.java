package com.content.publishing.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDtos {

    public record RegisterRequest(
            @NotBlank @Size(min = 2, max = 100) String name,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 6, max = 100) String password,
            String role   // optional — defaults to EDITOR in UserService
    ) {}

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank @Size(min = 6, max = 100) String password
    ) {}

    public record UserResponse(Long id, String name, String email, String role) {}

    public record AuthResponse(String token, UserResponse user) {}

    // Admin DTOs
    public record RoleUpdateRequest(String role) {}
}
