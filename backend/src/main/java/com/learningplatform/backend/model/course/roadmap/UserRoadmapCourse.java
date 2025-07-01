package com.learningplatform.backend.model.course.roadmap;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

@Entity
public class UserRoadmapCourse {
    @Id
    @GeneratedValue
    private Long id;

    private Long userId;
    private String courseId;
    private int courseOrder;
    private String courseDescription;
}

