// File: src/main/java/com/learningplatform/backend/model/Course.java
package com.learningplatform.backend.model;

import jakarta.persistence.*;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "courses")
public class Course {

    @Id
    private String id; // Use String for course ID to match FastAPI
    private String name;
    private String description;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Resource> documentationLinks = new ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Resource> notesLinks = new ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Resource> videoLinks = new ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuizQuestion> quizQuestions = new ArrayList<>();

    // Constructors
    public Course() {}

    public Course(String id, String name, String description) {
        this.id = id;
        this.name = name;
        this.description = description;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<Resource> getDocumentationLinks() { return documentationLinks; }
    public void setDocumentationLinks(List<Resource> documentationLinks) {
        this.documentationLinks.clear();
        if (documentationLinks != null) {
            this.documentationLinks.addAll(documentationLinks);
        }
    }

    public List<Resource> getNotesLinks() { return notesLinks; }
    public void setNotesLinks(List<Resource> notesLinks) {
        this.notesLinks.clear();
        if (notesLinks != null) {
            this.notesLinks.addAll(notesLinks);
        }
    }

    public List<Resource> getVideoLinks() { return videoLinks; }
    public void setVideoLinks(List<Resource> videoLinks) {
        this.videoLinks.clear();
        if (videoLinks != null) {
            this.videoLinks.addAll(videoLinks);
        }
    }

    public List<QuizQuestion> getQuizQuestions() { return quizQuestions; }
    public void setQuizQuestions(List<QuizQuestion> quizQuestions) {
        this.quizQuestions.clear();
        if (quizQuestions != null) {
            this.quizQuestions.addAll(quizQuestions);
        }
    }
}