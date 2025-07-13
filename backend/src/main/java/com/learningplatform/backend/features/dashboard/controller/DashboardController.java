package com.learningplatform.backend.features.dashboard.controller;

import com.learningplatform.backend.features.dashboard.dto.response.DashboardResponseDTO;
import com.learningplatform.backend.features.dashboard.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader; // Import RequestHeader
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private static final Logger logger = LoggerFactory.getLogger(DashboardController.class);

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<DashboardResponseDTO> getDashboard(
            @AuthenticationPrincipal Long userId,
            @RequestHeader(value = "X-Skip-AI-Summary", defaultValue = "false", required = false) boolean skipAiSummary // New parameter
    ) {
        if (userId == null) {
            logger.warn("Attempted to access dashboard without authenticated user ID.");
            return ResponseEntity.status(401).build();
        }
        logger.info("Fetching dashboard data for user ID: {}. Skip AI summary: {}", userId, skipAiSummary); // Log the new header value
        
        // Pass the boolean flag to the service
        DashboardResponseDTO dashboardData = dashboardService.getDashboardData(userId, skipAiSummary);
        return ResponseEntity.ok(dashboardData);
    }
}