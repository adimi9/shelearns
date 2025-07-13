package com.learningplatform.backend.features.progress.resource.dto.response;

public class ResourceProgressResponse {
    private Long id;
    private Long userId;
    private Long resourceId;
    private boolean completionStatus;
    private String message;

    public ResourceProgressResponse() {
    }

    public ResourceProgressResponse(Long id, Long userId, Long resourceId, boolean completionStatus, String message) {
        this.id = id;
        this.userId = userId;
        this.resourceId = resourceId;
        this.completionStatus = completionStatus;
        this.message = message;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getResourceId() {
        return resourceId;
    }

    // --- FIX APPLIED HERE ---
    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId; // Corrected: Assign the incoming parameter directly
    }
    // --- END FIX ---

    public boolean isCompletionStatus() {
        return completionStatus;
    }

    public void setCompletionStatus(boolean completionStatus) {
        this.completionStatus = completionStatus;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}