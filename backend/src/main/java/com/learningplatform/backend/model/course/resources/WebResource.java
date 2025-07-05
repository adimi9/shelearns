package com.learningplatform.backend.model.course.resources;

import jakarta.persistence.*;

@Entity
@Table(name = "Web_Resource")
@PrimaryKeyJoinColumn(name = "Resource_ID")
public class WebResource extends Resource {

    @Column(name = "Name")
    private String name;

    @Column(name = "Description")
    private String description;

    @Column(name = "Link")
    private String link;

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
