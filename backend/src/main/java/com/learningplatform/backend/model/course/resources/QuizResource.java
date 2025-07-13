package com.learningplatform.backend.model.course.resources;

import jakarta.persistence.*;

@Entity
@Table(name = "quiz_resource") // Using "quiz_question" for consistency with PostgreSQL lowercase
@PrimaryKeyJoinColumn(name = "resource_id") // Points to the inherited Resource_ID
public class QuizResource extends Resource { // !!! Now extends Resource !!!

    // No longer needs questionId @Id, @GeneratedValue, @Column(name="Question_ID")
    // because Resource_ID from the parent Resource entity willbe  used as the PK

    @Column(name = "question", columnDefinition = "TEXT") // <-- ADD THIS
    private String question;

    @Column(name = "option_1") // Using "option_1" for consistency
    private String option1;

    @Column(name = "option_2") // Using "option_2" for consistency
    private String option2;

    @Column(name = "option_3") // Using "option_3" for consistency
    private String option3;

    @Column(name = "option_4") // Using "option_4" for consistency
    private String option4;

    @Column(name = "correct_option") // Using "correct_option" for consistency
    private Integer correctOption;

    @Column(name = "hint", columnDefinition = "TEXT") // <-- ADD THIS
    private String hint;

    // question_order is already in the Resource parent, so remove it here
    // private Integer questionOrder; // REMOVED as it's inherited from Resource

    // Getters and setters (removed questionId getters/setters as it's no longer here)

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getOption1() { return option1; }
    public void setOption1(String option1) { this.option1 = option1; }

    public String getOption2() { return option2; }
    public void setOption2(String option2) { this.option2 = option2; }

    public String getOption3() { return option3; }
    public void setOption3(String option3) { this.option3 = option3; }

    public String getOption4() { return option4; }
    public void setOption4(String option4) { this.option4 = option4; }

    public Integer getCorrectOption() { return correctOption; }
    public void setCorrectOption(Integer correctOption) { this.correctOption = correctOption; }

    public String getHint() { return hint; }
    public void setHint(String hint) { this.hint = hint; }

    // No longer need getQuestionOrder/setQuestionOrder here, as it's inherited
    // You will use getResourceOrder/setResourceOrder from the Resource parent.
}