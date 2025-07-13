package com.learningplatform.backend.features.leaderboard.dto.response;

public class LeaderboardEntryDto {
    private Long userId;
    private String username;
    private int weeklyXp;
    private int rank; // Rank within the filtered group
    private String avatarType; // <-- NEW FIELD for avatar type

    public LeaderboardEntryDto(Long userId, String username, int weeklyXp, int rank, String avatarType) {
        this.userId = userId;
        this.username = username;
        this.weeklyXp = weeklyXp;
        this.rank = rank;
        this.avatarType = avatarType; // Initialize new field
    }

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public int getWeeklyXp() {
        return weeklyXp;
    }

    public void setWeeklyXp(int weeklyXp) {
        this.weeklyXp = weeklyXp;
    }

    public int getRank() {
        return rank;
    }

    public void setRank(int rank) {
        this.rank = rank;
    }

    public String getAvatarType() { // <-- NEW GETTER
        return avatarType;
    }

    public void setAvatarType(String avatarType) { // <-- NEW SETTER
        this.avatarType = avatarType;
    }

    // You might want to add toString(), equals(), hashCode() for good practice
}