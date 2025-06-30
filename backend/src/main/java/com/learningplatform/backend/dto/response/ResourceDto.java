// File: src/main/java/com/learningplatform/backend/dto/response/ResourceDto.java
package com.learningplatform.backend.dto.response;

public class ResourceDto {
    private String name;
    private String description;
    private String link;
    private boolean completionStatus; // Assuming this is boolean

    // Constructors, Getters, and Setters

    public ResourceDto() {
    }

    public ResourceDto(String name, String description, String link, boolean completionStatus) {
        this.name = name;
        this.description = description;
        this.link = link;
        this.completionStatus = completionStatus;
    }

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

    public boolean isCompletionStatus() {
        return completionStatus;
    }

    public void setCompletionStatus(boolean completionStatus) {
        this.completionStatus = completionStatus;
    }
}