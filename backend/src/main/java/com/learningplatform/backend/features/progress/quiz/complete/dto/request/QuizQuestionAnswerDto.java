package com.learningplatform.backend.features.progress.quiz.complete.dto.request;

import jakarta.validation.constraints.NotNull;

public class QuizQuestionAnswerDto {
    @NotNull(message = "Resource ID cannot be null")
    private Long resourceId; // This is the ID of the QuizResource (the question)
    
    @NotNull(message = "User answer cannot be null")
    private Integer selectedOption; // The option number (1, 2, 3, or 4) the user selected

    // Constructors
    public QuizQuestionAnswerDto() {
    }

    public QuizQuestionAnswerDto(Long resourceId, Integer selectedOption) {
        this.resourceId = resourceId;
        this.selectedOption = selectedOption;
    }

    // Getters and Setters
    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    public Integer getSelectedOption() {
        return selectedOption;
    }

    public void setSelectedOption(Integer selectedOption) {
        this.selectedOption = selectedOption;
    }
}