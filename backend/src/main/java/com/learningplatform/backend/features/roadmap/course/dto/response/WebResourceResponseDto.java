package com.learningplatform.backend.features.roadmap.course.dto.response;

import com.learningplatform.backend.model.course.resources.enums.ResourceType;

public class WebResourceResponseDto extends ResourceResponseDto {
    private String name;
    private String description;
    private String link;

    public WebResourceResponseDto(Long resourceId, String name, String description, String link,
                                  ResourceType resourceType, Integer resourceXp, Integer resourceOrder,
                                  boolean completed) { // ADD `completed` parameter
        // Call the superclass constructor to initialize common fields
        super(resourceId, resourceType, resourceXp, resourceOrder, completed); // PASS `completed`
        this.name = name;
        this.description = description;
        this.link = link;
    }

    // Getters for specific fields
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getLink() { return link; }

    // Setters (if needed)
    public void setName(String name) { this.name = name; }
    public void setDescription(String description) { this.description = description; }
    public void setLink(String link) { this.link = link; }
}