package com.learningplatform.backend.features.roadmap.course.controller;

import com.learningplatform.backend.features.roadmap.course.dto.response.CourseLevelDetailsResponseDto;
import com.learningplatform.backend.features.roadmap.course.service.CourseService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.security.Principal; // Import for Principal

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private static final Logger logger = LoggerFactory.getLogger(CourseController.class);

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping("/{courseLevelId}")
    public ResponseEntity<CourseLevelDetailsResponseDto> getCourseDetailsByLevel(
            @PathVariable Long courseLevelId,
            Principal principal) { // Add Principal to get the authenticated user's information
        
        // Extract userId from Principal.
        // This assumes your Principal contains the user's ID directly as its name,
        // or you have a custom UserDetails implementation where you can cast Principal
        // and get the ID. A common pattern is to parse it from principal.getName().
        // For demonstration, let's assume principal.getName() is the user's ID as a String.
        Long userId = null;
        if (principal != null && principal.getName() != null) {
            try {
                userId = Long.valueOf(principal.getName());
                logger.info("Received request for CourseLevel ID: {} for authenticated User ID: {}", courseLevelId, userId);
            } catch (NumberFormatException e) {
                logger.error("Invalid user ID format from principal: {}", principal.getName(), e);
                // Handle case where user ID from principal is not a valid Long
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
        } else {
            logger.warn("No authenticated user found for request to CourseLevel ID: {}. Returning unauthorized.", courseLevelId);
            // If no user is authenticated, you might return 401 Unauthorized or 403 Forbidden
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return courseService.getCourseLevelDetails(courseLevelId, userId) // Pass the userId to the service
                .map(detailsDto -> {
                    logger.info("Successfully retrieved course details for CourseLevel ID: {}", courseLevelId);
                    return ResponseEntity.ok(detailsDto);
                })
                .orElseGet(() -> {
                    logger.warn("CourseLevel with ID {} not found, returning 404.", courseLevelId);
                    return ResponseEntity.notFound().build();
                });
    }
}