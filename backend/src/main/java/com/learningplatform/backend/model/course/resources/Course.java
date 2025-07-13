package com.learningplatform.backend.model.course.resources;

import java.util.List;
import jakarta.persistence.*;

@Entity
@Table(name = "Course")
public class Course {

    @Id
    @Column(name = "Course_ID")
    private String courseId;

    @Column(name = "Course_Name")
    private String courseName;

    @Column(name = "Course_Category")
    private String courseCategory;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    private List<CourseLevel> levels;

    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public String getCourseCategory() { return courseCategory; }
    public void setCourseCategory(String courseCategory) { this.courseCategory = courseCategory; }

    public List<CourseLevel> getLevels() { return levels; }
    public void setLevels(List<CourseLevel> levels) { this.levels = levels; }
}
