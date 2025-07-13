package com.learningplatform.backend.features.dashboard.dto.response;

public class InProgressCourseNameDto {
    private String courseId;
    private String courseName;

    public InProgressCourseNameDto(String courseId, String courseName) {
        this.courseId = courseId;
        this.courseName = courseName;
    }

    // Getters and Setters
    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }
}
