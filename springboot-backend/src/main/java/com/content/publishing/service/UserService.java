package com.content.publishing.service;

import com.content.publishing.dto.AuthDtos.AuthResponse;
import com.content.publishing.dto.AuthDtos.LoginRequest;
import com.content.publishing.dto.AuthDtos.RegisterRequest;
import com.content.publishing.dto.AuthDtos.UserResponse;
import com.content.publishing.entity.AppUser;
import com.content.publishing.entity.AppUser.Role;
import com.content.publishing.repository.AppUserRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(AppUserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        AppUser user = new AppUser();
        user.setName(request.name().trim());
        user.setEmail(request.email().toLowerCase().trim());
        user.setPasswordHash(passwordEncoder.encode(request.password()));

        // Parse role — default to EDITOR if missing or unrecognised
        Role role = Role.EDITOR;
        if (request.role() != null && !request.role().isBlank()) {
            try {
                role = Role.valueOf(request.role().toUpperCase());
            } catch (IllegalArgumentException ignored) {
                // keep default EDITOR
            }
        }
        user.setRole(role);

        user = userRepository.save(user);
        String token = jwtService.generateToken(user.getId());
        return new AuthResponse(token, toUserResponse(user));
    }

    public AuthResponse authenticate(LoginRequest request) {
        AppUser user = userRepository.findByEmail(request.email().toLowerCase().trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        String token = jwtService.generateToken(user.getId());
        return new AuthResponse(token, toUserResponse(user));
    }

    public UserResponse validateToken(String authorization) {
        String token = authorization.replace("Bearer ", "").trim();
        Long userId = jwtService.extractUserId(token);
        AppUser user = requireUser(userId);
        return toUserResponse(user);
    }

    public AppUser requireUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    // ── Admin helpers ─────────────────────────────────────────────────

    public List<UserResponse> listAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toUserResponse)
                .toList();
    }

    public UserResponse updateRole(Long userId, String roleName) {
        AppUser user = requireUser(userId);
        try {
            user.setRole(Role.valueOf(roleName.toUpperCase()));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role: " + roleName);
        }
        user = userRepository.save(user);
        return toUserResponse(user);
    }

    // ── Mapper ────────────────────────────────────────────────────────

    private UserResponse toUserResponse(AppUser user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole() != null ? user.getRole().name() : "EDITOR"
        );
    }
}
