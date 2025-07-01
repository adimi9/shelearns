package com.learningplatform.backend.features.onboarding.dto.response;

public class CourseResponseDto {
    private String courseId;
    private String name;
    private String description;
    private Long numDocs;
    private Long numNotes;
    private Long numVideos;
    private Integer totalXP;

    public CourseResponseDto() {
        // default constructor
    }

    public CourseResponseDto(String courseId, String name, String description) {
        this.courseId = courseId;
        this.name = name;
        this.description = description;
    }

    public String getCourseId() {
        return courseId;
    }
    public void setCourseId(String courseId) {
        this.courseId = courseId;
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

    public Long getNumDocs() {
        return numDocs;
    }
    public void setNumDocs(Long numDocs) {
        this.numDocs = numDocs;
    }

    public Long getNumNotes() {
        return numNotes;
    }
    public void setNumNotes(Long numNotes) {
        this.numNotes = numNotes;
    }

    public Long getNumVideos() {
        return numVideos;
    }
    public void setNumVideos(Long numVideos) {
        this.numVideos = numVideos;
    }

    public Integer getTotalXP() {
        return totalXP;
    }
    public void setTotalXP(Integer totalXP) {
        this.totalXP = totalXP;
    }
}
