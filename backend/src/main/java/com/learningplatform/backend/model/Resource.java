// File: src/main/java/com/learningplatform/backend/model/Resource.java
package com.learningplatform.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "resources")
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private String link;
    private boolean completionStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course; // Link back to Course

    @Column(nullable = false)
    private String resourceType; // e.g., "DOCUMENTATION", "NOTE", "VIDEO"

    // Constructors
    public Resource() {}

    public Resource(String name, String description, String link, boolean completionStatus, String resourceType, Course course) {
        this.name = name;
        this.description = description;
        this.link = link;
        this.completionStatus = completionStatus;
        this.resourceType = resourceType;
        this.course = course;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }

    public boolean isCompletionStatus() { return completionStatus; }
    public void setCompletionStatus(boolean completionStatus) { this.completionStatus = completionStatus; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public String getResourceType() { return resourceType; }
    public void setResourceType(String resourceType) { this.resourceType = resourceType; }
}