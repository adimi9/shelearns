package com.learningplatform.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

// Entity annotation signals that this Course class belongs to a table in the database
@Entity
// Table annotation specifies that the Course entity should be mapped to a table named exactly 'courses' in PostgreSQL database
@Table(name = "courses")
public class Course {

    // Define fields for the Course entity

    // Id annotation specifies the primary key for the table
    @Id
    // GeneratedValue annotation specifies how the unique ID is generated
    // - in this case, strategy = GenerationType.IDENTITY delegates ID generation to database itself
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // Long to store a very large number of records
    private Long id;

    // Other fields for the Course entity
    private String courseName; // maps to course_name (auto converts camelCase to snake_case)
    private String courseLevel;

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public String getCourseLevel() {
        return courseLevel;
    }

    public void setCourseLevel(String courseLevel) {
        this.courseLevel = courseLevel;
    }
}