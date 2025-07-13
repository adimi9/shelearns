package com.learningplatform.backend.features.roadmap.overall.controller; // Adjust package as necessary

// Spring Framework dependencies
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal; // For JWT authentication

import com.learningplatform.backend.features.roadmap.overall.dto.response.RoadmapResponseDto; // Import your specific DTO
import com.learningplatform.backend.features.roadmap.overall.service.RoadmapService;

@RestController
@RequestMapping("/api/roadmap") // The API endpoint path
public class RoadmapController {

    private final RoadmapService roadmapService;

    // Constructor for dependency injection
    public RoadmapController(RoadmapService roadmapService) {
        this.roadmapService = roadmapService;
    }

    /**
     * Retrieves the personalized learning roadmap for the authenticated user.
     * The user ID is extracted directly from the JWT.
     *
     * @param userId The ID of the authenticated user, provided by @AuthenticationPrincipal.
     * @return A ResponseEntity containing the RoadmapResponseDto or an appropriate error.
     */
    @GetMapping // No need for a path variable in the URL if userId is from JWT
    public ResponseEntity<RoadmapResponseDto> getUserRoadmap(
        @AuthenticationPrincipal Long userId) { // userId is extracted from JWT
        // Log to confirm authentication is working and userId is present
        if (userId == null) {
            // This case should ideally be handled by Spring Security's authentication
            // but as a fallback, or for clarity, you can add a check.
            // In a real application, Spring Security would likely return 401 Unauthorized
            // before this method is even called if the user isn't authenticated.
            return ResponseEntity.status(401).build(); // Unauthorized if userId is null
        }

        RoadmapResponseDto roadmap = roadmapService.getUserRoadmap(userId);

        // Return HTTP 200 OK with the roadmap data
        return ResponseEntity.ok(roadmap);
    }
}