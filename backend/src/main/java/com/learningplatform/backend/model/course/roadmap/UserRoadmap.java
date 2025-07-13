package com.learningplatform.backend.model.course.roadmap;

import java.util.ArrayList; // Good practice to initialize collections
import java.util.List;

import com.learningplatform.backend.model.user.User;

import jakarta.persistence.CascadeType; // Import CascadeType
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType; // Import FetchType
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToMany; // Import OneToMany
import jakarta.persistence.OneToOne;

@Entity
public class UserRoadmap {

    // Fields 

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Or UUID.randomUUID() if using String
    private Long id; // New separate primary key

    @Column(name = "user_id") // Keep user_id as a regular column
    private Long userId; // Keep this field for business logic

    @Column(name = "intro_paragraph", columnDefinition = "TEXT") // <-- ADD THIS LINE
    private String introParagraph;

    // foreign keys and dependencies 

    @OneToOne // Keep the one-to-one, but don't map ID
    @JoinColumn(name = "user_id", insertable = false, updatable = false) // Map via user_id column, ensure not managed by Hibernate
    private User user; // Keep this for referencing the user object

    @OneToMany(mappedBy = "userRoadmap", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<UserRoadmapCourse> recommendedCourses = new ArrayList<>();

    // Getters and Setters 

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getIntroParagraph() { return introParagraph; }
    public void setIntroParagraph(String introParagraph) { this.introParagraph = introParagraph; }

    public List<UserRoadmapCourse> getRecommendedCourses() { return recommendedCourses; }
    public void setRecommendedCourses(List<UserRoadmapCourse> recommendedCourses) { this.recommendedCourses = recommendedCourses; }

    public User getUser() { return user; }
    public void setUser(User user) {
        this.user = user;
        this.userId = user.getId(); // Keep IDs in sync
    }

}