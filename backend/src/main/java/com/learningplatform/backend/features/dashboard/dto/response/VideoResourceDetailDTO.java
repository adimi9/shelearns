package com.learningplatform.backend.features.dashboard.dto.response;

public class VideoResourceDetailDTO extends ResourceProgressDetailDTO {
    private String name;
    private String duration;
    private String link;

    // Constructors
    public VideoResourceDetailDTO() {
        super();
    }

    // This constructor assumes the superclass constructor is called first
    public VideoResourceDetailDTO(Long resourceId, com.learningplatform.backend.model.course.resources.enums.ResourceType resourceType,
                                  Integer resourceOrder, Integer resourceXp, boolean completedByUser,
                                  String name, String duration, String link) {
        super(resourceId, resourceType, resourceOrder, resourceXp, completedByUser);
        this.name = name;
        this.duration = duration;
        this.link = link;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }
}