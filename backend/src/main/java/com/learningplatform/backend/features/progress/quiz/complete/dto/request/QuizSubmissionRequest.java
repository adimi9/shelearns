package com.learningplatform.backend.features.progress.quiz.complete.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class QuizSubmissionRequest {
    @NotEmpty(message = "Quiz answers list cannot be empty")
    @Valid // This ensures validation is applied to each item in the list
    private List<QuizQuestionAnswerDto> answers;

    // Constructors
    public QuizSubmissionRequest() {
    }

    public QuizSubmissionRequest(List<QuizQuestionAnswerDto> answers) {
        this.answers = answers;
    }

    // Getters and Setters
    public List<QuizQuestionAnswerDto> getAnswers() {
        return answers;
    }

    public void setAnswers(List<QuizQuestionAnswerDto> answers) {
        this.answers = answers;
    }
}