package com.learningplatform.backend.features.dashboard.client.dto.response;

import java.util.List;

public class AnalysisResponseDto {
    private String overall_paragraph;
    private List<String> strengths;
    private List<String> recommendations;

    // Constructors
    public AnalysisResponseDto() {}

    public AnalysisResponseDto(String overall_paragraph, List<String> strengths, List<String> recommendations) {
        this.overall_paragraph = overall_paragraph;
        this.strengths = strengths;
        this.recommendations = recommendations;
    }

    // Getters and Setters
    public String getOverall_paragraph() {
        return overall_paragraph;
    }

    public void setOverall_paragraph(String overall_paragraph) {
        this.overall_paragraph = overall_paragraph;
    }

    public List<String> getStrengths() {
        return strengths;
    }

    public void setStrengths(List<String> strengths) {
        this.strengths = strengths;
    }

    public List<String> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<String> recommendations) {
        this.recommendations = recommendations;
    }
}