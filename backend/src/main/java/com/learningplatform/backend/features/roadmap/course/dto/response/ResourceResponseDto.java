package com.learningplatform.backend.features.roadmap.course.dto.response;

import com.learningplatform.backend.model.course.resources.enums.ResourceType;

public class ResourceResponseDto {
    private Long resourceId;
    private ResourceType resourceType;
    private Integer resourceXp;
    private Integer resourceOrder;
    private boolean completed; // ADD THIS FIELD

    // Constructor for common fields - ADD `completed` parameter
    public ResourceResponseDto(Long resourceId, ResourceType resourceType, Integer resourceXp, Integer resourceOrder, boolean completed) {
        this.resourceId = resourceId;
        this.resourceType = resourceType;
        this.resourceXp = resourceXp;
        this.resourceOrder = resourceOrder;
        this.completed = completed; // Initialize
    }

    // Getters
    public Long getResourceId() { return resourceId; }
    public ResourceType getResourceType() { return resourceType; }
    public Integer getResourceXp() { return resourceXp; }
    public Integer getResourceOrder() { return resourceOrder; }
    public boolean isCompleted() { return completed; } // GETTER for completed

    // Setters (if needed, but for DTOs, often only getters are used after construction)
    public void setResourceId(Long resourceId) { this.resourceId = resourceId; }
    public void setResourceType(ResourceType resourceType) { this.resourceType = resourceType; }
    public void setResourceXp(Integer resourceXp) { this.resourceXp = resourceXp; }
    public void setResourceOrder(Integer resourceOrder) { this.resourceOrder = resourceOrder; }
    public void setCompleted(boolean completed) { this.completed = completed; } // SETTER for completed
}