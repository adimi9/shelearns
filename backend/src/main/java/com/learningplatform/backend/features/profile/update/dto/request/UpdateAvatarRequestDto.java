package com.learningplatform.backend.features.profile.update.dto.request;

public class UpdateAvatarRequestDto {
    private String avatarType;

    public UpdateAvatarRequestDto() {}

    public UpdateAvatarRequestDto(String avatarType) {
        this.avatarType = avatarType;
    }

    public String getAvatarType() {
        return avatarType;
    }

    public void setAvatarType(String avatarType) {
        this.avatarType = avatarType;
    }
}
