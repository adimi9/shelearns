package com.learningplatform.backend.features.progress.quiz.tryagain.dto.response;

import java.util.List;

public class QuizResetResponse {
    private Long userId;
    private List<Long> resetResourceIds;
    private String message;
    private int quizzesResetCount;

    // Constructors
    public QuizResetResponse() {
    }

    public QuizResetResponse(Long userId, List<Long> resetResourceIds, String message, int quizzesResetCount) {
        this.userId = userId;
        this.resetResourceIds = resetResourceIds;
        this.message = message;
        this.quizzesResetCount = quizzesResetCount;
    }

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public List<Long> getResetResourceIds() {
        return resetResourceIds;
    }

    public void setResetResourceIds(List<Long> resetResourceIds) {
        this.resetResourceIds = resetResourceIds;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public int getQuizzesResetCount() {
        return quizzesResetCount;
    }

    public void setQuizzesResetCount(int quizzesResetCount) {
        this.quizzesResetCount = quizzesResetCount;
    }
}