package com.learningplatform.backend.features.profile.identity.controller;

import com.learningplatform.backend.features.profile.identity.dto.response.IdentityResponse;
import com.learningplatform.backend.features.profile.identity.service.IdentityService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/profile/identity")
public class IdentityController {

    private static final Logger logger = LoggerFactory.getLogger(IdentityController.class);

    private final IdentityService identityService;

    public IdentityController(IdentityService identityService) {
        this.identityService = identityService;
    }

    @GetMapping
    public ResponseEntity<IdentityResponse> getUserProfile(@AuthenticationPrincipal Long userId) {
        if (userId == null) {
            logger.warn("Attempted to access user profile without authenticated user ID.");
            return ResponseEntity.status(401).build(); // Unauthorized
        }
        logger.info("Fetching user profile for user ID: {}", userId);
        try {
            IdentityResponse response = identityService.getUserProfile(userId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.error("Error fetching profile for user ID {}: {}", userId, e.getMessage());
            return ResponseEntity.notFound().build(); // User not found scenario
        } catch (IllegalStateException e) {
            logger.error("Data inconsistency for user ID {}: {}", userId, e.getMessage());
            return ResponseEntity.internalServerError().build(); // Profile/Onboarding data not linked correctly
        } catch (Exception e) {
            logger.error("An unexpected error occurred while fetching profile for user ID {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
