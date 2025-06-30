// File: src/main/java/com/learningplatform/backend/controller/OnboardingController.java
package com.learningplatform.backend.controller;

import com.learningplatform.backend.dto.request.OnboardingRequest; // Create this DTO
import com.learningplatform.backend.dto.response.ErrorResponse;
import com.learningplatform.backend.dto.response.OnboardingResponse; // Create this DTO
import com.learningplatform.backend.service.OnboardingService; // Create this service

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // For JWT security
import org.springframework.security.core.annotation.AuthenticationPrincipal; // To get authenticated user
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/onboarding")
public class OnboardingController {

    private final OnboardingService onboardingService;

    public OnboardingController(OnboardingService onboardingService) {
        this.onboardingService = onboardingService;
    }

    @PostMapping("/submit-questionnaire")
    @PreAuthorize("isAuthenticated()") // Ensure only authenticated users can access
    public ResponseEntity<?> submitQuestionnaire(
            @Valid @RequestBody OnboardingRequest onboardingRequest,
            @AuthenticationPrincipal UserDetails userDetails, // Get currently authenticated user's details
            HttpServletRequest request
    ) {
        try {
            // The email from UserDetails should match your User entity's email or name
            String userEmail = userDetails.getUsername(); // Assuming username is email

            OnboardingResponse response = onboardingService.processOnboarding(userEmail, onboardingRequest);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Bad Request", e.getMessage(), request.getRequestURI()));
        } catch (Exception e) {
            System.err.println("An error occurred during onboarding: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Internal Server Error", "An error occurred during onboarding.", request.getRequestURI()));
        }
    }
}