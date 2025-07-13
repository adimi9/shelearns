package com.learningplatform.backend.features.roadmap.course.dto.response;

import com.learningplatform.backend.model.course.resources.enums.ResourceType;

public class VideoResourceResponseDto extends ResourceResponseDto {
    private String name;
    private String duration;
    private String link;

    public VideoResourceResponseDto(Long resourceId, String name, String duration, String link,
                                    ResourceType resourceType, Integer resourceXp, Integer resourceOrder,
                                    boolean completed) { // ADD `completed` parameter
        super(resourceId, resourceType, resourceXp, resourceOrder, completed); // PASS `completed`
        this.name = name;
        this.duration = duration;
        this.link = link;
    }

    // Getters
    public String getName() { return name; }
    public String getDuration() { return duration; }
    public String getLink() { return link; }

    // Setters (if needed)
    public void setName(String name) { this.name = name; }
    public void setDuration(String duration) { this.duration = duration; }
    public void setLink(String link) { this.link = link; }
}