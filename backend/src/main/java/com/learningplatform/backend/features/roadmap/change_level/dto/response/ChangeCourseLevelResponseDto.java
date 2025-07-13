package com.learningplatform.backend.features.roadmap.change_level.dto.response;

import com.learningplatform.backend.model.course.resources.enums.LevelName;

public class ChangeCourseLevelResponseDto {
    private boolean success;
    private String message;
    private Long updatedCourseLevelId; // The new CourseLevel ID set in the roadmap
    private LevelName updatedLevelName;   // The new LevelName set
    private String courseName;           // The name of the course involved

    // No-argument constructor
    public ChangeCourseLevelResponseDto() {}

    // All-argument constructor
    public ChangeCourseLevelResponseDto(boolean success, String message, Long updatedCourseLevelId, LevelName updatedLevelName, String courseName) {
        this.success = success;
        this.message = message;
        this.updatedCourseLevelId = updatedCourseLevelId;
        this.updatedLevelName = updatedLevelName;
        this.courseName = courseName;
    }

    // Getters
    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public Long getUpdatedCourseLevelId() { return updatedCourseLevelId; }
    public LevelName getUpdatedLevelName() { return updatedLevelName; }
    public String getCourseName() { return courseName; }

    // Setters
    public void setSuccess(boolean success) { this.success = success; }
    public void setMessage(String message) { this.message = message; }
    public void setUpdatedCourseLevelId(Long updatedCourseLevelId) { this.updatedCourseLevelId = updatedCourseLevelId; }
    public void setUpdatedLevelName(LevelName updatedLevelName) { this.updatedLevelName = updatedLevelName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }
}