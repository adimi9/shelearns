package com.learningplatform.backend.model.course.progress;

import com.learningplatform.backend.model.course.resources.Resource;
import com.learningplatform.backend.model.user.User;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.GenerationType;

@Entity
public class UserLinkedResourceProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Use IDENTITY for auto-incrementing primary key
    private Long id;

    // Many-to-one relationship with User
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false) // Foreign key column in UserLinkedResourceProgress table
    private User user;

    // Many-to-one relationship with Resource
    @ManyToOne
    @JoinColumn(name = "resource_id", nullable = false) // Foreign key column in UserLinkedResourceProgress table
    private Resource resource;

    private boolean completionStatus;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Resource getResource() { return resource; }
    public void setResource(Resource resource) { this.resource = resource; }

    public boolean isCompletionStatus() { return completionStatus; }
    public void setCompletionStatus(boolean completionStatus) { this.completionStatus = completionStatus; }
}
