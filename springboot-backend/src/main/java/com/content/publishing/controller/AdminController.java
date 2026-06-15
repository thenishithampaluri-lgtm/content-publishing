package com.content.publishing.controller;

import com.content.publishing.dto.AuthDtos.RoleUpdateRequest;
import com.content.publishing.dto.AuthDtos.UserResponse;
import com.content.publishing.service.UserService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Admin-only endpoints.
 * The FastAPI gateway enforces ADMIN role before forwarding requests here.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users")
    public List<UserResponse> listUsers() {
        return userService.listAllUsers();
    }

    @PutMapping("/users/{userId}/role")
    public UserResponse updateRole(
            @PathVariable Long userId,
            @RequestBody RoleUpdateRequest request
    ) {
        return userService.updateRole(userId, request.role());
    }
}
