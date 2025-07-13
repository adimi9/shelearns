package com.learningplatform.backend.features.dashboard.dto.response;

public class LeaderboardEntryForDashboard {
        private Long userId;
        private int weeklyXp;

        public LeaderboardEntryForDashboard(Long userId, int weeklyXp) {
            this.userId = userId;
            this.weeklyXp = weeklyXp;
        }

        public Long getUserId() {
            return userId;
        }

        public int getWeeklyXp() {
            return weeklyXp;
        }
    }