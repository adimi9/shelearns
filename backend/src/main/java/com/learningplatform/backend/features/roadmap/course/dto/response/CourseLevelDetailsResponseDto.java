package com.learningplatform.backend.features.roadmap.course.dto.response;

import com.learningplatform.backend.model.course.resources.enums.LevelName;

public class CourseLevelDetailsResponseDto {
    private Long id; // Maps to courseLevelId
    private String title; // Maps to courseName
    private LevelName levelName;
    private CourseSectionsDto sections;
    private Integer totalQuizScore; // <--- NEW FIELD FOR TOTAL QUIZ SCORE

    public CourseLevelDetailsResponseDto() {}

    // Updated constructor with totalQuizScore
    public CourseLevelDetailsResponseDto(Long id, String title, LevelName levelName, CourseSectionsDto sections, Integer totalQuizScore) {
        this.id = id;
        this.title = title;
        this.levelName = levelName;
        this.sections = sections;
        this.totalQuizScore = totalQuizScore;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public LevelName getLevelName() { return levelName; }
    public void setLevelName(LevelName levelName) { this.levelName = levelName; }

    public CourseSectionsDto getSections() { return sections; }
    public void setSections(CourseSectionsDto sections) { this.sections = sections; }

    public Integer getTotalQuizScore() { return totalQuizScore; }
    public void setTotalQuizScore(Integer totalQuizScore) { this.totalQuizScore = totalQuizScore; }
}