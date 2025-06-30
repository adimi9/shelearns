// File: src/main/java/com/learningplatform/backend/dto/response/QuizQuestionDto.java
package com.learningplatform.backend.dto.response;

import java.util.List;

public class QuizQuestionDto {
    private String qnName;
    private List<String> optionsPossible;
    private String correctOption;
    private boolean qnAnsweredStatus;
    private String optionPicked; // Can be null if not answered

    // Constructors, Getters, and Setters

    public QuizQuestionDto() {
    }

    public QuizQuestionDto(String qnName, List<String> optionsPossible, String correctOption, boolean qnAnsweredStatus, String optionPicked) {
        this.qnName = qnName;
        this.optionsPossible = optionsPossible;
        this.correctOption = correctOption;
        this.qnAnsweredStatus = qnAnsweredStatus;
        this.optionPicked = optionPicked;
    }

    public String getQnName() {
        return qnName;
    }

    public void setQnName(String qnName) {
        this.qnName = qnName;
    }

    public List<String> getOptionsPossible() {
        return optionsPossible;
    }

    public void setOptionsPossible(List<String> optionsPossible) {
        this.optionsPossible = optionsPossible;
    }

    public String getCorrectOption() {
        return correctOption;
    }

    public void setCorrectOption(String correctOption) {
        this.correctOption = correctOption;
    }

    public boolean isQnAnsweredStatus() {
        return qnAnsweredStatus;
    }

    public void setQnAnsweredStatus(boolean qnAnsweredStatus) {
        this.qnAnsweredStatus = qnAnsweredStatus;
    }

    public String getOptionPicked() {
        return optionPicked;
    }

    public void setOptionPicked(String optionPicked) {
        this.optionPicked = optionPicked;
    }
}