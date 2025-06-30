// File: src/main/java/com/learningplatform/backend/dto/response/OnboardingResponse.java
package com.learningplatform.backend.dto.response;

import java.util.List;

public class OnboardingResponse {
    private String introParagraph;
    private List<CourseRecommendationDto> recommendedCourses;

    // Constructors, Getters, and Setters

    public OnboardingResponse() {
    }

    public OnboardingResponse(String introParagraph, List<CourseRecommendationDto> recommendedCourses) {
        this.introParagraph = introParagraph;
        this.recommendedCourses = recommendedCourses;
    }

    public String getIntroParagraph() {
        return introParagraph;
    }

    public void setIntroParagraph(String introParagraph) {
        this.introParagraph = introParagraph;
    }

    public List<CourseRecommendationDto> getRecommendedCourses() {
        return recommendedCourses;
    }

    public void setRecommendedCourses(List<CourseRecommendationDto> recommendedCourses) {
        this.recommendedCourses = recommendedCourses;
    }
}