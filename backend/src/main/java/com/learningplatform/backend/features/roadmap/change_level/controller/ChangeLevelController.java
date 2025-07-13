package com.learningplatform.backend.features.roadmap.change_level.controller;

import com.learningplatform.backend.features.roadmap.change_level.dto.request.ChangeCourseLevelRequestDto;
import com.learningplatform.backend.features.roadmap.change_level.dto.response.ChangeCourseLevelResponseDto;
import com.learningplatform.backend.features.roadmap.change_level.service.ChangeLevelService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal; // Import for @AuthenticationPrincipal
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/roadmaps")
public class ChangeLevelController {

    private static final Logger logger = LoggerFactory.getLogger(ChangeLevelController.class);

    private final ChangeLevelService changeLevelService;

    public ChangeLevelController(ChangeLevelService changeLevelService) {
        this.changeLevelService = changeLevelService;
    }

    /**
     * Endpoint to change the level of a specific course in a user's roadmap.
     * The user ID is extracted from the authentication principal (JWT).
     *
     * @param userId The ID of the authenticated user, provided by @AuthenticationPrincipal.
     * @param request The DTO containing the current course level ID and the new desired level name.
     * @return A ResponseEntity with the result of the operation.
     */
    @PutMapping("/change-level") // REMOVED {userId} from path
    public ResponseEntity<ChangeCourseLevelResponseDto> changeCourseLevel(
            @AuthenticationPrincipal Long userId, // User ID now from JWT
            @Valid @RequestBody ChangeCourseLevelRequestDto request) {
        try {
            logger.info("Received request to change course level for authenticated user ID: {}", userId);
            ChangeCourseLevelResponseDto response = changeLevelService.changeCourseLevel(userId, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.error("Error changing course level for user ID {}: {}", userId, e.getMessage());
            // For not found scenarios or invalid inputs
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ChangeCourseLevelResponseDto(
                    false, e.getMessage(), null, null, null));
        } catch (Exception e) {
            logger.error("An unexpected error occurred while changing course level for user ID {}: {}", userId, e.getMessage(), e);
            // Generic internal server error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ChangeCourseLevelResponseDto(
                    false, "An unexpected error occurred: " + e.getMessage(), null, null, null));
        }
    }
}