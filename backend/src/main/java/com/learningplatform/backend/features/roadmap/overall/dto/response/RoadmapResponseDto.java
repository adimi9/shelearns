package com.learningplatform.backend.features.roadmap.overall.dto.response;

import java.util.List;

public class RoadmapResponseDto {
    private String introParagraph;
    private List<CourseLevelResponseDto> courses;
    private String category; // <-- NEW FIELD

    public String getIntroParagraph() {
        return introParagraph;
    }
    public void setIntroParagraph(String introParagraph) {
        this.introParagraph = introParagraph;
    }

    public List<CourseLevelResponseDto> getCourses() {
        return courses;
    }
    public void setCourses(List<CourseLevelResponseDto> courses) {
        this.courses = courses;
    }

    // --- NEW GETTER AND SETTER FOR CATEGORY ---
    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
    // --- END NEW GETTER AND SETTER ---
}