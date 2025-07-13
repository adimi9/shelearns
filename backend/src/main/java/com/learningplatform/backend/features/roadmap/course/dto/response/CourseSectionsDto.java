package com.learningplatform.backend.features.roadmap.course.dto.response;

import java.util.List;

public class CourseSectionsDto {
    private List<WebResourceResponseDto> officialDocs;
    private List<WebResourceResponseDto> notes;
    private List<VideoResourceResponseDto> course; // Holds video resources
    private List<QuizResourceResponseDto> quiz;

    public CourseSectionsDto() {}

    public CourseSectionsDto(
            List<WebResourceResponseDto> officialDocs,
            List<WebResourceResponseDto> notes,
            List<VideoResourceResponseDto> course,
            List<QuizResourceResponseDto> quiz) {
        this.officialDocs = officialDocs;
        this.notes = notes;
        this.course = course;
        this.quiz = quiz;
    }

    public List<WebResourceResponseDto> getOfficialDocs() { return officialDocs; }
    public void setOfficialDocs(List<WebResourceResponseDto> officialDocs) { this.officialDocs = officialDocs; }

    public List<WebResourceResponseDto> getNotes() { return notes; }
    public void setNotes(List<WebResourceResponseDto> notes) { this.notes = notes; }

    public List<VideoResourceResponseDto> getCourse() { return course; }
    public void setCourse(List<VideoResourceResponseDto> course) { this.course = course; }

    public List<QuizResourceResponseDto> getQuiz() { return quiz; }
    public void setQuiz(List<QuizResourceResponseDto> quiz) { this.quiz = quiz; }
}
