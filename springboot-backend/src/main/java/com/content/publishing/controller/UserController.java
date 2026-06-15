package com.content.publishing.controller;

import com.content.publishing.dto.AuthDtos.AuthResponse;
import com.content.publishing.dto.AuthDtos.LoginRequest;
import com.content.publishing.dto.AuthDtos.RegisterRequest;
import com.content.publishing.dto.AuthDtos.UserResponse;
import com.content.publishing.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return userService.register(request);
    }

    @PostMapping("/authenticate")
    public AuthResponse authenticate(@Valid @RequestBody LoginRequest request) {
        return userService.authenticate(request);
    }

    @PostMapping("/validate")
    public UserResponse validate(@RequestHeader("Authorization") String authorization) {
        return userService.validateToken(authorization);
    }
}
