package com.learningplatform.backend.features.onboarding.client.dto.request;

import java.util.Map;

public class FastApiRequestDto {
    private Map<String, Object> questionnaire;

    public FastApiRequestDto() {}

    public FastApiRequestDto(Map<String, Object> questionnaire) {
        this.questionnaire = questionnaire;
    }

    public Map<String, Object> getQuestionnaire() {
        return questionnaire;
    }

    public void setQuestionnaire(Map<String, Object> questionnaire) {
        this.questionnaire = questionnaire;
    }
}
