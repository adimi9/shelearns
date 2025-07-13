package com.learningplatform.backend.model.user.onboarding;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.FetchType;
import jakarta.persistence.Table;

@Entity
@Table(name = "user_onboarding_ans4") // This will be the new table for individual answers
public class UserOnboardingAns4 {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // The dedicated primary key for this answer entry

    @Column(name = "answer_text", nullable = false)
    private String answerText; // The actual answer string (e.g., "Software Development")

    // Many UserOnboardingAns4 entries belong to one UserOnboardingData
    @ManyToOne(fetch = FetchType.LAZY) // Use LAZY loading for performance
    @JoinColumn(name = "onboarding_data_id", nullable = false) // Foreign key to UserOnboardingData's primary key
    private UserOnboardingData userOnboardingData;

    // --- Constructors ---
    public UserOnboardingAns4() {
    }

    public UserOnboardingAns4(String answerText, UserOnboardingData userOnboardingData) {
        this.answerText = answerText;
        this.userOnboardingData = userOnboardingData;
    }

    // --- Getters and Setters ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAnswerText() {
        return answerText;
    }

    public void setAnswerText(String answerText) {
        this.answerText = answerText;
    }

    public UserOnboardingData getUserOnboardingData() {
        return userOnboardingData;
    }

    public void setUserOnboardingData(UserOnboardingData userOnboardingData) {
        this.userOnboardingData = userOnboardingData;
    }
}