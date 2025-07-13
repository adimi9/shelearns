package com.learningplatform.backend.model.course.resources;

import jakarta.persistence.*;

@Entity
@Table(name = "Video_Resource")
@PrimaryKeyJoinColumn(name = "Resource_ID")
public class VideoResource extends Resource {

    @Column(name = "name", columnDefinition = "TEXT") // <-- ADD THIS
    private String name;

    @Column(name = "Duration")
    private String duration;

    @Column(name = "link", columnDefinition = "TEXT") // <-- ADD THIS
    private String link;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }
}
