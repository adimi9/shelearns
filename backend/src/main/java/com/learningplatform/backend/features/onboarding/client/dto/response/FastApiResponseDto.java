// 📁 FastApiResponseDto.java
package com.learningplatform.backend.features.onboarding.client.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class FastApiResponseDto {

    @JsonProperty("intro_paragraph")
    private String introParagraph;

    @JsonProperty("recommended_courses")
    private List<FastApiCourseDto> recommendedCourses;

    public String getIntroParagraph() {
        return introParagraph;
    }
    public void setIntroParagraph(String introParagraph) {
        this.introParagraph = introParagraph;
    }

    public List<FastApiCourseDto> getRecommendedCourses() {
        return recommendedCourses;
    }
    public void setRecommendedCourses(List<FastApiCourseDto> recommendedCourses) {
        this.recommendedCourses = recommendedCourses;
    }
}
