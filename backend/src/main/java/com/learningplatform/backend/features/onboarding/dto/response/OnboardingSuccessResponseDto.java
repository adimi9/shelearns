package com.learningplatform.backend.features.onboarding.dto.response;

public class OnboardingSuccessResponseDto {
    private String message;

    public OnboardingSuccessResponseDto(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
