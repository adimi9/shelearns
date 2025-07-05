package com.learningplatform.backend.model.course.resources;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "Quiz_Resource")
@PrimaryKeyJoinColumn(name = "Resource_ID")
public class QuizResource extends Resource {

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "Resource_ID")
    @OrderBy("questionOrder ASC")
    private List<QuizQuestion> questions;

    public List<QuizQuestion> getQuestions() {
        return questions;
    }

    public void setQuestions(List<QuizQuestion> questions) {
        this.questions = questions;
    }
}
