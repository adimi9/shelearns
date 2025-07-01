package com.learningplatform.backend.model.course.roadmap;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class UserRoadmapIntro {
    @Id
    private Long userId;

    private String introParagraph;
}

