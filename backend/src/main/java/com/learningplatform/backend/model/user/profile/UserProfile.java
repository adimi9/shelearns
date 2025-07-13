package com.learningplatform.backend.model.user.profile;

import com.learningplatform.backend.model.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalDate; // Import LocalDate

@Entity
@Table(name = "user_profiles")
public class UserProfile {

    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "avatar_type")
    private String avatarType;

    @Column(name = "total_xp", nullable = false)
    private int totalXp;

    @Column(name = "weekly_xp", nullable = false)
    private int weeklyXp;

    @Column(name = "last_weekly_reset_time", nullable = false)
    private LocalDateTime lastWeeklyResetTime;

    @Column(name = "current_login_streak", nullable = false) // NEW FIELD
    private int currentLoginStreak;

    @Column(name = "last_login_date") // NEW FIELD (can be null for new users before first login)
    private LocalDate lastLoginDate;

    // No-arg constructor
    public UserProfile() {
        this.totalXp = 0;
        this.weeklyXp = 0;
        this.lastWeeklyResetTime = getStartOfCurrentWeekStatic(LocalDateTime.now());
        this.currentLoginStreak = 0; // Initialize streak to 0
        this.lastLoginDate = null;   // Initialize last login date to null
    }

    // Constructor for initial creation (when a user signs up)
    public UserProfile(User user, String avatarType) {
        this.user = user;
        this.avatarType = avatarType;
        this.totalXp = 0;
        this.weeklyXp = 0;
        this.lastWeeklyResetTime = getStartOfCurrentWeekStatic(LocalDateTime.now());
        this.currentLoginStreak = 0; // New users start with 0 streak
        this.lastLoginDate = null;   // New users have no prior login date
    }

    // All-args constructor (if needed for specific use cases like data migration/testing)
    public UserProfile(User user, String avatarType, int totalXp, int weeklyXp,
                       LocalDateTime lastWeeklyResetTime, int currentLoginStreak, LocalDate lastLoginDate) {
        this.user = user;
        this.avatarType = avatarType;
        this.totalXp = totalXp;
        this.weeklyXp = weeklyXp;
        this.lastWeeklyResetTime = lastWeeklyResetTime;
        this.currentLoginStreak = currentLoginStreak;
        this.lastLoginDate = lastLoginDate;
    }

    // Getters and setters (Existing ones omitted for brevity)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getAvatarType() { return avatarType; }
    public void setAvatarType(String avatarType) { this.avatarType = avatarType; }

    public int getTotalXp() { return totalXp; }
    public void setTotalXp(int totalXp) { this.totalXp = totalXp; }

    public int getWeeklyXp() { return weeklyXp; }
    public void setWeeklyXp(int weeklyXp) { this.weeklyXp = weeklyXp; }

    public LocalDateTime getLastWeeklyResetTime() { return lastWeeklyResetTime; }
    public void setLastWeeklyResetTime(LocalDateTime lastWeeklyResetTime) { this.lastWeeklyResetTime = lastWeeklyResetTime; }

    public int getCurrentLoginStreak() { return currentLoginStreak; } // NEW GETTER
    public void setCurrentLoginStreak(int currentLoginStreak) { this.currentLoginStreak = currentLoginStreak; } // NEW SETTER

    public LocalDate getLastLoginDate() { return lastLoginDate; } // NEW GETTER
    public void setLastLoginDate(LocalDate lastLoginDate) { this.lastLoginDate = lastLoginDate; } // NEW SETTER

    public static LocalDateTime getStartOfCurrentWeekStatic(LocalDateTime dateTime) {
        return dateTime.toLocalDate().atStartOfDay()
                .with(java.time.DayOfWeek.SUNDAY);
    }
}