package com.learningplatform.backend.model.course.roadmap;

import com.learningplatform.backend.model.course.resources.enums.LevelName;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne; // Import ManyToOne
import jakarta.persistence.JoinColumn; // Import JoinColumn

@Entity
public class UserRoadmapCourse {

    // Fields 

    @Id
    @GeneratedValue
    private Long id;

    private LevelName levelName; 
    private Long courseLevelId; 
    private int courseOrder;
    
    @Column(name = "course_description", columnDefinition = "TEXT")
    private String courseDescription;

    @ManyToOne
    @JoinColumn(name = "user_roadmap_user_id") 
    private UserRoadmap userRoadmap; 

    // Getters and Setters 

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LevelName getLevelName() { return levelName; }
    public void setLevelName(LevelName levelName) { this.levelName = levelName; }

    public Long getCourseLevelId() { return courseLevelId; }
    public void setCourseLevelId(Long courseLevelId) { this.courseLevelId = courseLevelId; }

    public int getCourseOrder() { return courseOrder; }
    public void setCourseOrder(int courseOrder) { this.courseOrder = courseOrder; }

    public String getCourseDescription() { return courseDescription; }
    public void setCourseDescription(String courseDescription) { this.courseDescription = courseDescription; }

    public UserRoadmap getUserRoadmap() { return userRoadmap; }
    public void setUserRoadmap(UserRoadmap userRoadmap) { this.userRoadmap = userRoadmap; }
}