package com.learningplatform.backend.model.course.progress;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

@Entity
public class UserQuizQuestionProgress {
    @Id
    @GeneratedValue
    private Long id;

    private Long userId;
    private String questionId;
    private boolean correctAnswer;
    private int chosenOption;
}

