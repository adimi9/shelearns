package com.learningplatform.backend.features.profile.overall.dto.response;

import java.util.List;

public class ProfileResponse {
    private String username;
    private String email;
    private int totalXp;
    private String avatarType;
    private OnboardingDataDto onboardingData;
    private List<BadgeDto> earnedBadges;
    private List<BadgeDto> unearnedBadges;

    public ProfileResponse(String username, String email, int totalXp, String avatarType,
                           OnboardingDataDto onboardingData,
                           List<BadgeDto> earnedBadges, List<BadgeDto> unearnedBadges) {
        this.username = username;
        this.email = email;
        this.totalXp = totalXp;
        this.avatarType = avatarType;
        this.onboardingData = onboardingData;
        this.earnedBadges = earnedBadges;
        this.unearnedBadges = unearnedBadges;
    }

    // Getters
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public int getTotalXp() { return totalXp; }
    public String getAvatarType() { return avatarType; }
    public OnboardingDataDto getOnboardingData() { return onboardingData; }
    public List<BadgeDto> getEarnedBadges() { return earnedBadges; }
    public List<BadgeDto> getUnearnedBadges() { return unearnedBadges; }

    // Setters (if needed)
    public void setUsername(String username) { this.username = username; }
    public void setEmail(String email) { this.email = email; }
    public void setTotalXp(int totalXp) { this.totalXp = totalXp; }
    public void setAvatarType(String avatarType) { this.avatarType = avatarType; }
    public void setOnboardingData(OnboardingDataDto onboardingData) { this.onboardingData = onboardingData; }
    public void setEarnedBadges(List<BadgeDto> earnedBadges) { this.earnedBadges = earnedBadges; }
    public void setUnearnedBadges(List<BadgeDto> unearnedBadges) { this.unearnedBadges = unearnedBadges; }
}
