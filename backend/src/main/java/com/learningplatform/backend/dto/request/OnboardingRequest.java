// File: src/main/java/com/learningplatform/backend/dto/request/OnboardingRequest.java
package com.learningplatform.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import java.util.Map;
import java.util.List;

public class OnboardingRequest {
    @NotNull(message = "Questionnaire responses cannot be null")
    private Map<String, List<String>> questionnaireResponses;

    public Map<String, List<String>> getQuestionnaireResponses() {
        return questionnaireResponses;
    }

    public void setQuestionnaireResponses(Map<String, List<String>> questionnaireResponses) {
        this.questionnaireResponses = questionnaireResponses;
    }
}