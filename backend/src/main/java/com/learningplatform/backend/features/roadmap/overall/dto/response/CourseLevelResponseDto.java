package com.learningplatform.backend.features.roadmap.overall.dto.response;

import com.learningplatform.backend.model.course.resources.enums.LevelName;

public class CourseLevelResponseDto {
    private Long courseLevelId;
    private String courseName;
    private LevelName levelName;
    private String description;
    private Long numDocs;
    private Long numNotes;
    private Long numVideos;
    private Integer totalXP;
    private Integer achievedXP; // NEW FIELD: Total XP achieved for this course level
    private Integer progress;   // Percentage progress (0-100)

    public CourseLevelResponseDto() {
        // default constructor
    }

    public CourseLevelResponseDto(Long courseLevelId, String courseName, LevelName levelName, String description) {
        this.courseLevelId = courseLevelId;
        this.courseName = courseName;
        this.levelName = levelName;
        this.description = description;
    }

    // Getters and Setters for all fields

    public Long getCourseLevelId() {
        return courseLevelId;
    }

    public void setCourseLevelId(Long courseLevelId) {
        this.courseLevelId = courseLevelId;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public LevelName getLevelName() {
        return levelName;
    }

    public void setLevelName(LevelName levelName) {
        this.levelName = levelName;
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

    public Integer getAchievedXP() {
        return achievedXP;
    }

    public void setAchievedXP(Integer achievedXP) {
        this.achievedXP = achievedXP;
    }

    public Integer getProgress() {
        return progress;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
    }
}