package com.learningplatform.backend.features.profile.identity.dto.response;

import java.util.List;

public class IdentityResponse {
    private String username;
    private String avatarType;

    public IdentityResponse(String username, String avatarType) {
        this.username = username;
        this.avatarType = avatarType;
    }

    // Getters
    public String getUsername() { return username; }
    public String getAvatarType() { return avatarType; }
    

    // Setters (if needed)
    public void setUsername(String username) { this.username = username; }
    public void setAvatarType(String avatarType) { this.avatarType = avatarType; }
}
