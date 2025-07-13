package com.learningplatform.backend.features.dashboard.dto.response;

import com.learningplatform.backend.model.course.resources.enums.ResourceType;

public abstract class ResourceProgressDetailDTO {
    protected Long resourceId;
    protected ResourceType resourceType;
    protected Integer resourceOrder;
    protected Integer resourceXp;
    protected boolean completedByUser; // Status for this specific resource by the user

    // Constructors
    public ResourceProgressDetailDTO() {
    }

    public ResourceProgressDetailDTO(Long resourceId, ResourceType resourceType, Integer resourceOrder, Integer resourceXp, boolean completedByUser) {
        this.resourceId = resourceId;
        this.resourceType = resourceType;
        this.resourceOrder = resourceOrder;
        this.resourceXp = resourceXp;
        this.completedByUser = completedByUser;
    }

    // Getters and Setters
    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    public ResourceType getResourceType() {
        return resourceType;
    }

    public void setResourceType(ResourceType resourceType) {
        this.resourceType = resourceType;
    }

    public Integer getResourceOrder() {
        return resourceOrder;
    }

    public void setResourceOrder(Integer resourceOrder) {
        this.resourceOrder = resourceOrder;
    }

    public Integer getResourceXp() {
        return resourceXp;
    }

    public void setResourceXp(Integer resourceXp) {
        this.resourceXp = resourceXp;
    }

    public boolean isCompletedByUser() { // Note: boolean getters often start with "is"
        return completedByUser;
    }

    public void setCompletedByUser(boolean completedByUser) {
        this.completedByUser = completedByUser;
    }
}