package com.learningplatform.backend.features.leaderboard.controller;

import com.learningplatform.backend.features.leaderboard.dto.response.LeaderboardResponse;
import com.learningplatform.backend.features.leaderboard.service.LeaderboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    private static final Logger logger = LoggerFactory.getLogger(LeaderboardController.class);

    private final LeaderboardService leaderboardService;

    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    @GetMapping
    public ResponseEntity<LeaderboardResponse> getPersonalizedLeaderboard(@AuthenticationPrincipal Long userId) {
        if (userId == null) {
            logger.warn("Attempted to access leaderboard without authenticated user ID.");
            return ResponseEntity.status(401).build(); // Unauthorized
        }
        logger.info("Fetching personalized leaderboard for user ID: {}", userId);
        LeaderboardResponse response = leaderboardService.getPersonalizedLeaderboard(userId);
        return ResponseEntity.ok(response);
    }
}