package com.learningplatform.backend.model.user.profile;

import com.learningplatform.backend.model.user.User;
import jakarta.persistence.*;

@Entity
@Table(name = "user_profiles")
public class UserProfile {

    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    private String avatarType;  // e.g. "tech-girl", "code-ninja", etc.

    // No-arg constructor
    public UserProfile() {}

    // All-args constructor
    public UserProfile(Long id, User user, String avatarType) {
        this.id = id;
        this.user = user;
        this.avatarType = avatarType;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getAvatarType() {
        return avatarType;
    }

    public void setAvatarType(String avatarType) {
        this.avatarType = avatarType;
    }

    // Builder pattern (manual)
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private User user;
        private String avatarType;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder user(User user) {
            this.user = user;
            return this;
        }

        public Builder avatarType(String avatarType) {
            this.avatarType = avatarType;
            return this;
        }

        public UserProfile build() {
            return new UserProfile(id, user, avatarType);
        }
    }
}
