// File: src/main/java/com/learningplatform/backend/model/QuizQuestion.java
package com.learningplatform.backend.model;

import com.learningplatform.backend.converter.StringListConverter; // Import your new converter
import jakarta.persistence.*;
import java.util.List;
import java.util.ArrayList;

// Remove @TypeDef annotation
@Entity
@Table(name = "quiz_questions")
public class QuizQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String qnName;

    @Convert(converter = StringListConverter.class) // Use the JPA @Convert annotation
    @Column(name = "options_possible", columnDefinition = "jsonb") // Still define as jsonb in DB
    private List<String> optionsPossible = new ArrayList<>(); // Keep as List<String>

    private String correctOption;
    private boolean qnAnsweredStatus;
    private String optionPicked;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course; // Link back to Course

    // Constructors
    public QuizQuestion() {}

    public QuizQuestion(String qnName, List<String> optionsPossible, String correctOption,
                        boolean qnAnsweredStatus, String optionPicked, Course course) {
        this.qnName = qnName;
        this.optionsPossible = optionsPossible;
        this.correctOption = correctOption;
        this.qnAnsweredStatus = qnAnsweredStatus;
        this.optionPicked = optionPicked;
        this.course = course;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getQnName() { return qnName; }
    public void setQnName(String qnName) { this.qnName = qnName; }

    public List<String> getOptionsPossible() { return optionsPossible; }
    public void setOptionsPossible(List<String> optionsPossible) { this.optionsPossible = optionsPossible; }

    public String getCorrectOption() { return correctOption; }
    public void setCorrectOption(String correctOption) { this.correctOption = correctOption; }

    public boolean isQnAnsweredStatus() { return qnAnsweredStatus; }
    public void setQnAnsweredStatus(boolean qnAnsweredStatus) { this.qnAnsweredStatus = qnAnsweredStatus; }

    public String getOptionPicked() { return optionPicked; }
    public void setOptionPicked(String optionPicked) { this.optionPicked = optionPicked; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }
}