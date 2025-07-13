package com.learningplatform.backend.common.events;

import org.springframework.context.ApplicationEvent;

public class ResourceProgressUpdatedEvent extends ApplicationEvent {
    private final Long userId;
    private final Long resourceId;
    private final boolean completionStatus;

    public ResourceProgressUpdatedEvent(Object source, Long userId, Long resourceId, boolean completionStatus) {
        super(source);
        this.userId = userId;
        this.resourceId = resourceId;
        this.completionStatus = completionStatus;
    }

    public Long getUserId() { return userId; }
    public Long getResourceId() { return resourceId; }
    public boolean isCompletionStatus() { return completionStatus; }
}
