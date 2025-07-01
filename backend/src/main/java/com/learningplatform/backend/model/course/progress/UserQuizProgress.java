package com.learningplatform.backend.model.course.progress;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

@Entity
public class UserQuizProgress {
    @Id
    @GeneratedValue
    private Long id;

    private Long userId;
    private String resourceId;
    private boolean completionStatus;
    private int score;
}

