package com.learningplatform.backend.features.dashboard.dto.response;

public class WebResourceDetailDTO extends ResourceProgressDetailDTO {
    private String name;
    private String description;
    private String link;

    // Constructors
    public WebResourceDetailDTO() {
        super();
    }

    // This constructor assumes the superclass constructor is called first
    public WebResourceDetailDTO(Long resourceId, com.learningplatform.backend.model.course.resources.enums.ResourceType resourceType,
                                Integer resourceOrder, Integer resourceXp, boolean completedByUser,
                                String name, String description, String link) {
        super(resourceId, resourceType, resourceOrder, resourceXp, completedByUser);
        this.name = name;
        this.description = description;
        this.link = link;
    }

    // Getters and Setters
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

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }
}