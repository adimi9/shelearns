package com.learningplatform.backend.model.course.resources;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "Course_Level")
public class CourseLevel {

    public enum LevelName {
        beginner,
        intermediate,
        advanced
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Level_ID")
    private Long levelId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Course_ID", nullable = false)
    private Course course;

    @Enumerated(EnumType.STRING)
    @Column(name = "Level_Name")
    private LevelName levelName;

    @OneToMany(mappedBy = "courseLevel", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("resourceOrder ASC")
    private List<Resource> resources;

    public Long getLevelId() {
        return levelId;
    }

    public void setLevelId(Long levelId) {
        this.levelId = levelId;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public LevelName getLevelName() {
        return levelName;
    }

    public void setLevelName(LevelName levelName) {
        this.levelName = levelName;
    }

    public List<Resource> getResources() {
        return resources;
    }

    public void setResources(List<Resource> resources) {
        this.resources = resources;
    }
}
