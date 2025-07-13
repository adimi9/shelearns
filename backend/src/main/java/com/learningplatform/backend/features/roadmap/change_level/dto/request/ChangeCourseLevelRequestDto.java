package com.learningplatform.backend.features.roadmap.change_level.dto.request;

import com.learningplatform.backend.model.course.resources.enums.LevelName;
import jakarta.validation.constraints.NotNull;

public class ChangeCourseLevelRequestDto {

    @NotNull(message = "Current course level ID cannot be null.")
    private Long currentCourseLevelId; // The CourseLevel ID to be changed in the user's roadmap

    @NotNull(message = "New level name cannot be null.")
    private LevelName newLevelName; // The desired new level (e.g., INTERMEDIATE)

    // No-argument constructor (good practice for DTOs)
    public ChangeCourseLevelRequestDto() {}

    // Getters
    public Long getCurrentCourseLevelId() { return currentCourseLevelId; }
    public LevelName getNewLevelName() { return newLevelName; }

    // Setters
    public void setCurrentCourseLevelId(Long currentCourseLevelId) { this.currentCourseLevelId = currentCourseLevelId; }
    public void setNewLevelName(LevelName newLevelName) { this.newLevelName = newLevelName; }
}