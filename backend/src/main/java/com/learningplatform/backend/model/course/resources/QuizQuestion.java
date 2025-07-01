package com.learningplatform.backend.model.course.resources;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "quiz_question")
@Data
public class QuizQuestion {
    @Id
    @Column(name = "question_id")
    private Long questionId;

    @Column(name = "question")
    private String question;

    @Column(name = "option_1")
    private String option1;

    @Column(name = "option_2")
    private String option2;

    @Column(name = "option_3")
    private String option3;

    @Column(name = "option_4")
    private String option4;

    @Column(name = "correct_option")
    private int correctOption;

    @Column(name = "hint")
    private String hint;
}
