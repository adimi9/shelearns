package com.learningplatform.backend.model.course.resources;

import jakarta.persistence.*;

@Entity
@Table(name = "Quiz_Question")
public class QuizQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Question_ID")
    private Integer questionId;

    @Column(name = "Question")
    private String question;

    @Column(name = "Option_1")
    private String option1;

    @Column(name = "Option_2")
    private String option2;

    @Column(name = "Option_3")
    private String option3;

    @Column(name = "Option_4")
    private String option4;

    @Column(name = "Correct_Option")
    private Integer correctOption;

    @Column(name = "Hint")
    private String hint;

    @Column(name = "question_order")
    private Integer questionOrder;

    @Column(name = "Resource_ID")
    private Integer resourceId;

    // Getters and setters

    public Integer getQuestionId() { return questionId; }
    public void setQuestionId(Integer questionId) { this.questionId = questionId; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getOption1() { return option1; }
    public void setOption1(String option1) { this.option1 = option1; }

    public String getOption2() { return option2; }
    public void setOption2(String option2) { this.option2 = option2; }

    public String getOption3() { return option3; }

    public void setOption3(String option3) {
        this.option3 = option3;
    }

    public String getOption4() {
        return option4;
    }

    public void setOption4(String option4) {
        this.option4 = option4;
    }

    public Integer getCorrectOption() {
        return correctOption;
    }

    public void setCorrectOption(Integer correctOption) {
        this.correctOption = correctOption;
    }

    public String getHint() {
        return hint;
    }

    public void setHint(String hint) {
        this.hint = hint;
    }

    public Integer getQuestionOrder() {
        return questionOrder;
    }

    public void setQuestionOrder(Integer questionOrder) {
        this.questionOrder = questionOrder;
    }

    public Integer getResourceId() {
        return resourceId;
    }

    public void setResourceId(Integer resourceId) {
        this.resourceId = resourceId;
    }
}
