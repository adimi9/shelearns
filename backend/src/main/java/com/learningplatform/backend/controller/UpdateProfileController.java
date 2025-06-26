// File: src/main/java/com/learningplatform/backend/controller/UpdateProfileController.java

package com.learningplatform.backend.controller;

import com.learningplatform.backend.dto.request.UpdateProfileRequest;
import com.learningplatform.backend.dto.response.UpdateProfileResponse;
import com.learningplatform.backend.dto.response.ErrorResponse; // For error responses
import com.learningplatform.backend.service.UserService;
import com.learningplatform.backend.security.services.UserDetailsImpl;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
// import org.springframework.security.access.prepost.PreAuthorize; // <-- This line should be gone
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest; // Import HttpServletRequest

@RestController
@RequestMapping("/api/profile")
public class UpdateProfileController {

    private final UserService userService;

    // Constructor for dependency injection
    public UpdateProfileController(UserService userService) {
        this.userService = userService;
    }

    // Handles PATCH requests to /api/profile
    @PatchMapping
    // @PreAuthorize("hasRole('USER') or hasRole('ADMIN')") // <-- This line should be gone
    public ResponseEntity<?> updateProfile(
        @Valid @RequestBody UpdateProfileRequest updateProfileRequest,
        HttpServletRequest request // Inject HttpServletRequest to get the path
    ) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            Long authenticatedUserId = ((UserDetailsImpl) authentication.getPrincipal()).getId();

            UpdateProfileResponse updatedUserResponse = userService.updateUserProfile(
                authenticatedUserId,
                updateProfileRequest
            );

            return ResponseEntity.ok(updatedUserResponse);

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    // Pass the request URI as the path to the ErrorResponse constructor
                    .body(new ErrorResponse("Bad Request", e.getMessage(), request.getRequestURI()));

        } catch (Exception e) {
            System.err.println("An unexpected error occurred during profile update: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Internal Server Error", "An unexpected error occurred during profile update. Please try again later.", request.getRequestURI()));
        }
    }
}