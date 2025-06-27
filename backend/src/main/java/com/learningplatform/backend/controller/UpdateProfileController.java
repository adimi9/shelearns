// File: src/main/java/com/learningplatform/backend/controller/UpdateProfileController.java

package com.learningplatform.backend.controller;

import com.learningplatform.backend.dto.request.UpdateProfileRequest;
import com.learningplatform.backend.dto.response.UpdateProfileResponse;
import com.learningplatform.backend.dto.response.ErrorResponse;
import com.learningplatform.backend.service.UserService;
import com.learningplatform.backend.security.services.UserDetailsImpl;
import com.learningplatform.backend.dto.request.ChangePasswordRequest; // NEW: Import ChangePasswordRequest

import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest; // Import HttpServletRequest
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class UpdateProfileController {

    private final UserService userService;

    public UpdateProfileController(UserService userService) {
        this.userService = userService;
    }

    // Handles PATCH requests to /api/profile (for name/email update)
    @PatchMapping
    public ResponseEntity<?> updateProfile(
        @Valid @RequestBody UpdateProfileRequest updateProfileRequest,
        HttpServletRequest request
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
                    .body(new ErrorResponse("Bad Request", e.getMessage(), request.getRequestURI()));

        } catch (Exception e) {
            System.err.println("An unexpected error occurred during profile update: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Internal Server Error", "An unexpected error occurred during profile update. Please try again later.", request.getRequestURI()));
        }
    }

    // NEW ENDPOINT: Handles PATCH requests to /api/profile/password for password change
    @PatchMapping("/password") // New specific endpoint for password changes
    public ResponseEntity<?> changePassword(
        @Valid @RequestBody ChangePasswordRequest changePasswordRequest,
        HttpServletRequest request // To get the request URI for error responses
    ) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            Long authenticatedUserId = ((UserDetailsImpl) authentication.getPrincipal()).getId();

            userService.changePassword(authenticatedUserId, changePasswordRequest);

            // If successful, return 200 OK with no body, or a success message
            return ResponseEntity.ok().body("Password changed successfully.");

        } catch (IllegalArgumentException e) {
            // Catches validation errors (e.g., old password mismatch, new password mismatch)
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Bad Request", e.getMessage(), request.getRequestURI()));
        } catch (Exception e) {
            System.err.println("An unexpected error occurred: " + e.getMessage());
            e.printStackTrace(); // Log the full stack trace for debugging

            // For any other unexpected errors
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Internal Server Error", "An unexpected error occurred.", request.getRequestURI()));
        }
    }
}