package com.learningplatform.backend.features.dashboard.dto.response;

import com.learningplatform.backend.features.dashboard.client.dto.response.AnalysisResponseDto;

public class DashboardResponseDTO {

    private AnalysisResponseDto aiAnalysis;
    private int currentLoginStreak;
    private int totalXp;
    private int weeklyXp;
    private long totalBadgesEarned;
    private int leaderboardRank;
    private int totalUsersInLearningPath;
    private String userLearningPath;
    private int numberOfCoursesCompleted;   // NEW FIELD
    private int numberOfCoursesInProgress;  // NEW FIELD

    private String message; // OPTIONAL message for minimal responses



    // No-arg constructor
    public DashboardResponseDTO() {}

    // All-args constructor for the dashboard
    public DashboardResponseDTO(
            AnalysisResponseDto aiAnalysis,
            int currentLoginStreak,
            int totalXp,
            int weeklyXp,
            long totalBadgesEarned,
            int leaderboardRank,
            int totalUsersInLearningPath,
            String userLearningPath,
            int numberOfCoursesCompleted,   // NEW PARAMETER
            int numberOfCoursesInProgress,
            String message) { // NEW PARAMETER
        this.aiAnalysis = aiAnalysis;
        this.currentLoginStreak = currentLoginStreak;
        this.totalXp = totalXp;
        this.weeklyXp = weeklyXp;
        this.totalBadgesEarned = totalBadgesEarned;
        this.leaderboardRank = leaderboardRank;
        this.totalUsersInLearningPath = totalUsersInLearningPath;
        this.userLearningPath = userLearningPath;
        this.numberOfCoursesCompleted = numberOfCoursesCompleted;
        this.numberOfCoursesInProgress = numberOfCoursesInProgress;
        this.message = message; // NEW PARAMETER
    }

    // Getters and Setters
    public AnalysisResponseDto getAiAnalysis() {
        return aiAnalysis;
    }

    public void setAiAnalysis(AnalysisResponseDto aiAnalysis) {
        this.aiAnalysis = aiAnalysis;
    }

    public int getCurrentLoginStreak() {
        return currentLoginStreak;
    }

    public void setCurrentLoginStreak(int currentLoginStreak) {
        this.currentLoginStreak = currentLoginStreak;
    }

    public int getTotalXp() {
        return totalXp;
    }

    public void setTotalXp(int totalXp) {
        this.totalXp = totalXp;
    }

    public int getWeeklyXp() {
        return weeklyXp;
    }

    public void setWeeklyXp(int weeklyXp) {
        this.weeklyXp = weeklyXp;
    }

    public long getTotalBadgesEarned() {
        return totalBadgesEarned;
    }

    public void setTotalBadgesEarned(long totalBadgesEarned) {
        this.totalBadgesEarned = totalBadgesEarned;
    }

    public int getLeaderboardRank() {
        return leaderboardRank;
    }

    public void setLeaderboardRank(int leaderboardRank) {
        this.leaderboardRank = leaderboardRank;
    }

    public int getTotalUsersInLearningPath() {
        return totalUsersInLearningPath;
    }

    public void setTotalUsersInLearningPath(int totalUsersInLearningPath) {
        this.totalUsersInLearningPath = totalUsersInLearningPath;
    }

    public String getUserLearningPath() {
        return userLearningPath;
    }

    public void setUserLearningPath(String userLearningPath) {
        this.userLearningPath = userLearningPath;
    }

    public int getNumberOfCoursesCompleted() { // NEW GETTER
        return numberOfCoursesCompleted;
    }

    public void setNumberOfCoursesCompleted(int numberOfCoursesCompleted) { // NEW SETTER
        this.numberOfCoursesCompleted = numberOfCoursesCompleted;
    }

    public int getNumberOfCoursesInProgress() { // NEW GETTER
        return numberOfCoursesInProgress;
    }

    public void setNumberOfCoursesInProgress(int numberOfCoursesInProgress) { // NEW SETTER
        this.numberOfCoursesInProgress = numberOfCoursesInProgress;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

}