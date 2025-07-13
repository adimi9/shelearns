package com.learningplatform.backend.features.dashboard.dto.response;

public class QuizResourceDetailDTO extends ResourceProgressDetailDTO {
    private String question;
    private String option1;
    private String option2;
    private String option3;
    private String option4;
    private Integer correctOption;
    private String hint;

    // User's specific progress for this quiz
    private String userSelectedOption; // The option the user chose
    private boolean userIsCorrect;       // If the user's answer was correct
    private Integer userScore;           // Score obtained for this quiz attempt
    private boolean userQuizCompleted;   // If the user marked this specific quiz as completed (could be based on first attempt, or last)

    // Constructors
    public QuizResourceDetailDTO() {
        super();
    }

    // This constructor assumes the superclass constructor is called first
    public QuizResourceDetailDTO(Long resourceId, com.learningplatform.backend.model.course.resources.enums.ResourceType resourceType,
                                 Integer resourceOrder, Integer resourceXp, boolean completedByUser,
                                 String question, String option1, String option2, String option3, String option4,
                                 Integer correctOption, String hint, String userSelectedOption,
                                 boolean userIsCorrect, Integer userScore, boolean userQuizCompleted) {
        super(resourceId, resourceType, resourceOrder, resourceXp, completedByUser);
        this.question = question;
        this.option1 = option1;
        this.option2 = option2;
        this.option3 = option3;
        this.option4 = option4;
        this.correctOption = correctOption;
        this.hint = hint;
        this.userSelectedOption = userSelectedOption;
        this.userIsCorrect = userIsCorrect;
        this.userScore = userScore;
        this.userQuizCompleted = userQuizCompleted;
    }


    // Getters and Setters
    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getOption1() {
        return option1;
    }

    public void setOption1(String option1) {
        this.option1 = option1;
    }

    public String getOption2() {
        return option2;
    }

    public void setOption2(String option2) {
        this.option2 = option2;
    }

    public String getOption3() {
        return option3;
    }

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

    public String getUserSelectedOption() {
        return userSelectedOption;
    }

    public void setUserSelectedOption(String userSelectedOption) {
        this.userSelectedOption = userSelectedOption;
    }

    public boolean isUserIsCorrect() { // Note: boolean getters often start with "is"
        return userIsCorrect;
    }

    public void setUserIsCorrect(boolean userIsCorrect) {
        this.userIsCorrect = userIsCorrect;
    }

    public Integer getUserScore() {
        return userScore;
    }

    public void setUserScore(Integer userScore) {
        this.userScore = userScore;
    }

    public boolean isUserQuizCompleted() { // Note: boolean getters often start with "is"
        return userQuizCompleted;
    }

    public void setUserQuizCompleted(boolean userQuizCompleted) {
        this.userQuizCompleted = userQuizCompleted;
    }
}