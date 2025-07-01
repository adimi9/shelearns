package com.learningplatform.backend.features.onboarding.dto.response;

import java.util.List;

public class OnboardingResponseDto {
    private String introParagraph;
    private List<CourseResponseDto> courses;

    public String getIntroParagraph() {
        return introParagraph;
    }
    public void setIntroParagraph(String introParagraph) {
        this.introParagraph = introParagraph;
    }

    public List<CourseResponseDto> getCourses() {
        return courses;
    }
    public void setCourses(List<CourseResponseDto> courses) {
        this.courses = courses;
    }
}
