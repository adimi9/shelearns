package com.learningplatform.backend.features.dashboard.client.dto.request;

import com.learningplatform.backend.features.dashboard.dto.response.CourseProgressDTO; // Import your existing DTO
import com.learningplatform.backend.features.dashboard.dto.response.InProgressCourseNameDto; // Import your existing DTO
import java.util.List;

public class AnalysisRequestDto {
    // These fields directly map to the top-level keys in your FastAPI request JSON
    private List<CourseProgressDTO> completedCourses; // Reusing your existing DTO
    private List<InProgressCourseNameDto> inProgressCourses; // Reusing your existing DTO

    // Constructors
    public AnalysisRequestDto() {}

    public AnalysisRequestDto(List<CourseProgressDTO> completedCourses, List<InProgressCourseNameDto> inProgressCourses) {
        this.completedCourses = completedCourses;
        this.inProgressCourses = inProgressCourses;
    }

    // Getters and Setters
    public List<CourseProgressDTO> getCompletedCourses() {
        return completedCourses;
    }

    public void setCompletedCourses(List<CourseProgressDTO> completedCourses) {
        this.completedCourses = completedCourses;
    }

    public List<InProgressCourseNameDto> getInProgressCourses() {
        return inProgressCourses;
    }

    public void setInProgressCourses(List<InProgressCourseNameDto> inProgressCourses) {
        this.inProgressCourses = inProgressCourses;
    }
}