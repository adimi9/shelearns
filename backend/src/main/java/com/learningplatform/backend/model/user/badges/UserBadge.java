package com.learningplatform.backend.model.user.badges;

import com.learningplatform.backend.model.user.User; // Assuming your User entity is here
import com.learningplatform.backend.model.user.badges.enums.BadgeName;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_badge",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "badge_name"})) // A user can earn each badge only once
public class UserBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING) // Store enum name as string
    @Column(name = "badge_name", nullable = false)
    private BadgeName badgeName;

    @Column(name = "attainment_date", nullable = false)
    private LocalDateTime attainmentDate;

    // Constructors
    public UserBadge() {}

    public UserBadge(User user, BadgeName badgeName) {
        this.user = user;
        this.badgeName = badgeName;
        this.attainmentDate = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public BadgeName getBadgeName() { return badgeName; }
    public void setBadgeName(BadgeName badgeName) { this.badgeName = badgeName; }
    public LocalDateTime getAttainmentDate() { return attainmentDate; }
    public void setAttainmentDate(LocalDateTime attainmentDate) { this.attainmentDate = attainmentDate; }
}