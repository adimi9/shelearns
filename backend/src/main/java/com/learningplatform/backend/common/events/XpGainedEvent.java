package com.learningplatform.backend.common.events;

import org.springframework.context.ApplicationEvent;

public class XpGainedEvent extends ApplicationEvent {
    private final Long userId;
    private final int xpGained;
    private final int totalXp; // Current total XP after this gain
    private final int weeklyXp; // NEW: Current weekly XP after this gain

    public XpGainedEvent(Object source, Long userId, int xpGained, int totalXp, int weeklyXp) {
        super(source);
        this.userId = userId;
        this.xpGained = xpGained;
        this.totalXp = totalXp;
        this.weeklyXp = weeklyXp; // Assign new field
    }

    public Long getUserId() { return userId; }

    public int getXpGained() { return xpGained; }

    public int getTotalXp() { return totalXp; }

    public int getWeeklyXp() { return weeklyXp; }
}