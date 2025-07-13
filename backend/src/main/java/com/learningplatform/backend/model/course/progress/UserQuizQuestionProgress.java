package com.learningplatform.backend.model.course.progress;

import com.learningplatform.backend.model.user.User;
import com.learningplatform.backend.model.course.resources.QuizResource;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.GenerationType;

@Entity
public class UserQuizQuestionProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Reverted to 'questionResource' as requested
    @ManyToOne
    @JoinColumn(name = "quiz_resource_id", nullable = false) // Note: This column name might be better as 'question_resource_id' if you're sticking to the field name.
    private QuizResource questionResource;

    private String selectedOption;
    private boolean isCorrect;
    private Integer score;
    private boolean completed;

    // No-args constructor
    public UserQuizQuestionProgress() {}

    // Constructor to simplify initialization
    public UserQuizQuestionProgress(User user, QuizResource questionResource) {
        this.user = user;
        this.questionResource = questionResource;
        this.completed = false;
        this.isCorrect = false;
        this.score = 0;
    }

    // Getters
    public Long getId() { return id; }
    public User getUser() { return user; }
    public QuizResource getQuestionResource() { return questionResource; }
    public String getSelectedOption() { return selectedOption; }
    public boolean isCorrect() { return isCorrect; }
    public Integer getScore() { return score; }
    public boolean isCompleted() { return completed; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setQuestionResource(QuizResource questionResource) { this.questionResource = questionResource; }
    public void setSelectedOption(String selectedOption) { this.selectedOption = selectedOption; }
    public void setIsCorrect(boolean isCorrect) { this.isCorrect = isCorrect; }
    public void setScore(Integer score) { this.score = score; }
    public void setCompleted(boolean completed) { this.completed = completed; }
}