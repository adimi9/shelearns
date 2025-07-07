// 📁 FastApiCourseDto.java
package com.learningplatform.backend.features.onboarding.client.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public class FastApiCourseDto {
    @JsonProperty("id")  // Matches FastAPI's JSON field
    private String id;

    private String name;
    private String description;

    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
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
}
