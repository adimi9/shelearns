// File: src/main/java/com/learningplatform/backend/dto/response/CourseRecommendationDto.java
package com.learningplatform.backend.dto.response;

import java.util.List;

public class CourseRecommendationDto {
    private String id; // From FastAPI
    private String name; // From FastAPI
    private String description; // From FastAPI
    private List<ResourceDto> documentationLinks; // From DB
    private List<ResourceDto> notesLinks; // From DB
    private List<ResourceDto> videoLinks; // From DB
    private List<QuizQuestionDto> quizQuestions; // From DB

    // Constructors, Getters, and Setters

    public CourseRecommendationDto() {
    }

    public CourseRecommendationDto(String id, String name, String description,
                                   List<ResourceDto> documentationLinks,
                                   List<ResourceDto> notesLinks,
                                   List<ResourceDto> videoLinks,
                                   List<QuizQuestionDto> quizQuestions) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.documentationLinks = documentationLinks;
        this.notesLinks = notesLinks;
        this.videoLinks = videoLinks;
        this.quizQuestions = quizQuestions;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<ResourceDto> getDocumentationLinks() {
        return documentationLinks;
    }

    public void setDocumentationLinks(List<ResourceDto> documentationLinks) {
        this.documentationLinks = documentationLinks;
    }

    public List<ResourceDto> getNotesLinks() {
        return notesLinks;
    }

    public void setNotesLinks(List<ResourceDto> notesLinks) {
        this.notesLinks = notesLinks;
    }

    public List<ResourceDto> getVideoLinks() {
        return videoLinks;
    }

    public void setVideoLinks(List<ResourceDto> videoLinks) {
        this.videoLinks = videoLinks;
    }

    public List<QuizQuestionDto> getQuizQuestions() {
        return quizQuestions;
    }

    public void setQuizQuestions(List<QuizQuestionDto> quizQuestions) {
        this.quizQuestions = quizQuestions;
    }
}