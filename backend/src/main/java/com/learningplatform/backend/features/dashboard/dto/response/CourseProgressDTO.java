package com.learningplatform.backend.features.dashboard.dto.response;

import com.learningplatform.backend.model.course.resources.enums.LevelName;
import java.util.List;
import java.util.ArrayList; // Good practice to initialize lists

public class CourseProgressDTO {
    private String courseId;
    private String courseName;
    private String courseCategory;
    private Long levelId;
    private LevelName levelName;

    // Overall level progress
    private double levelOverallProgressPercentage;
    private Long totalResourcesInLevel;
    private Long completedResourcesCount;
    private Long inProgressResourcesCount;
    private Long notStartedResourcesCount; // How many resources haven't been touched

    // Detailed resource lists for this level
    private List<VideoResourceDetailDTO> videoResources = new ArrayList<>();
    private List<WebResourceDetailDTO> webResources = new ArrayList<>();
    private List<QuizResourceDetailDTO> quizResources = new ArrayList<>();

    // Constructors
    public CourseProgressDTO() {
    }

    public CourseProgressDTO(String courseId, String courseName, String courseCategory, Long levelId, LevelName levelName,
                             double levelOverallProgressPercentage, Long totalResourcesInLevel,
                             Long completedResourcesCount, Long inProgressResourcesCount,
                             Long notStartedResourcesCount, List<VideoResourceDetailDTO> videoResources,
                             List<WebResourceDetailDTO> webResources, List<QuizResourceDetailDTO> quizResources) {
        this.courseId = courseId;
        this.courseName = courseName;
        this.courseCategory = courseCategory;
        this.levelId = levelId;
        this.levelName = levelName;
        this.levelOverallProgressPercentage = levelOverallProgressPercentage;
        this.totalResourcesInLevel = totalResourcesInLevel;
        this.completedResourcesCount = completedResourcesCount;
        this.inProgressResourcesCount = inProgressResourcesCount;
        this.notStartedResourcesCount = notStartedResourcesCount;
        this.videoResources = videoResources;
        this.webResources = webResources;
        this.quizResources = quizResources;
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

    public String getCourseCategory() {
        return courseCategory;
    }

    public void setCourseCategory(String courseCategory) {
        this.courseCategory = courseCategory;
    }

    public Long getLevelId() {
        return levelId;
    }

    public void setLevelId(Long levelId) {
        this.levelId = levelId;
    }

    public LevelName getLevelName() {
        return levelName;
    }

    public void setLevelName(LevelName levelName) {
        this.levelName = levelName;
    }

    public double getLevelOverallProgressPercentage() {
        return levelOverallProgressPercentage;
    }

    public void setLevelOverallProgressPercentage(double levelOverallProgressPercentage) {
        this.levelOverallProgressPercentage = levelOverallProgressPercentage;
    }

    public Long getTotalResourcesInLevel() {
        return totalResourcesInLevel;
    }

    public void setTotalResourcesInLevel(Long totalResourcesInLevel) {
        this.totalResourcesInLevel = totalResourcesInLevel;
    }

    public Long getCompletedResourcesCount() {
        return completedResourcesCount;
    }

    public void setCompletedResourcesCount(Long completedResourcesCount) {
        this.completedResourcesCount = completedResourcesCount;
    }

    public Long getInProgressResourcesCount() {
        return inProgressResourcesCount;
    }

    public void setInProgressResourcesCount(Long inProgressResourcesCount) {
        this.inProgressResourcesCount = inProgressResourcesCount;
    }

    public Long getNotStartedResourcesCount() {
        return notStartedResourcesCount;
    }

    public void setNotStartedResourcesCount(Long notStartedResourcesCount) {
        this.notStartedResourcesCount = notStartedResourcesCount;
    }

    public List<VideoResourceDetailDTO> getVideoResources() {
        return videoResources;
    }

    public void setVideoResources(List<VideoResourceDetailDTO> videoResources) {
        this.videoResources = videoResources;
    }

    public List<WebResourceDetailDTO> getWebResources() {
        return webResources;
    }

    public void setWebResources(List<WebResourceDetailDTO> webResources) {
        this.webResources = webResources;
    }

    public List<QuizResourceDetailDTO> getQuizResources() {
        return quizResources;
    }

    public void setQuizResources(List<QuizResourceDetailDTO> quizResources) {
        this.quizResources = quizResources;
    }
}