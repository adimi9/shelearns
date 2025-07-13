package com.learningplatform.backend.features.profile.overall.dto.response;

public class BadgeDto {
    private String badgeName;
    private boolean earned;

    public BadgeDto(String badgeName, boolean earned) {
        this.badgeName = badgeName;
        this.earned = earned;
    }

    // Getters
    public String getBadgeName() { return badgeName; }
    public boolean isEarned() { return earned; }

    // Setters (if needed)
    public void setBadgeName(String badgeName) { this.badgeName = badgeName; }
    public void setEarned(boolean earned) { this.earned = earned; }
}
