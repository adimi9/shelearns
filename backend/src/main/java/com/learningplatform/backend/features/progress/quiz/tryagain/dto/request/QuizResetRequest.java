package com.learningplatform.backend.features.progress.quiz.tryagain.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class QuizResetRequest {
    @NotEmpty(message = "List of resource IDs to reset cannot be empty")
    private List<
            @NotNull(message = "Resource ID cannot be null")
            Long> resourceIds;

    // Constructors
    public QuizResetRequest() {
    }

    public QuizResetRequest(List<Long> resourceIds) {
        this.resourceIds = resourceIds;
    }

    // Getter and Setter
    public List<Long> getResourceIds() {
        return resourceIds;
    }

    public void setResourceIds(List<Long> resourceIds) {
        this.resourceIds = resourceIds;
    }
}