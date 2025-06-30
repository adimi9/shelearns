// File: src/main/java/com/learningplatform/backend/model/UserProfile.java
package com.learningplatform.backend.model;

import com.learningplatform.backend.converter.QuestionnaireResponsesConverter; // Import your new converter
import com.learningplatform.backend.model.enums.EAvatar;

import jakarta.persistence.*;

import java.util.List;
import java.util.Map;

@Entity
@Table(name = "user_profiles")
// Remove @TypeDef and @Type annotations
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private EAvatar avatar;

    // New field for questionnaire responses
    @Convert(converter = QuestionnaireResponsesConverter.class) // Use the JPA @Convert annotation
    @Column(name = "questionnaire_responses", columnDefinition = "jsonb") // Still define as jsonb in DB
    private Map<String, List<String>> questionnaireResponses; // Change type to List<String>

    // Constructors
    public UserProfile() {}

    public UserProfile(EAvatar avatar) {
        this();
        this.avatar = avatar;
    }

    public UserProfile(EAvatar avatar, Map<String, List<String>> questionnaireResponses) {
        this(avatar);
        this.questionnaireResponses = questionnaireResponses;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public EAvatar getAvatar() { return avatar; }
    public void setAvatar(EAvatar avatar) { this.avatar = avatar; }

    public Map<String, List<String>> getQuestionnaireResponses() { return questionnaireResponses; }
    public void setQuestionnaireResponses(Map<String, List<String>> questionnaireResponses) { this.questionnaireResponses = questionnaireResponses; }
}