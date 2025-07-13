package com.learningplatform.backend.features.roadmap.course.dto.response;

import com.learningplatform.backend.model.course.resources.enums.ResourceType;
import java.util.Arrays;
import java.util.List;

// Inside your QuizResourceResponseDto.java file

public class QuizResourceResponseDto extends ResourceResponseDto {
    private String questionText;
    private List<String> options;
    private Integer correctAnswerOption; // CHANGED FROM String TO Integer
    private String hint;

    private String userAnsweredOption;
    private boolean isCorrectlyAnswered;
    private Integer scoreAwarded;

    // Constructor for QuizResourceResponseDto - ADD new progress fields
    public QuizResourceResponseDto(Long resourceId, String questionText,
                                   String option1, String option2, String option3, String option4,
                                   Integer correctAnswerOption, String hint, // CHANGED FROM String TO Integer
                                   ResourceType resourceType, Integer resourceXp, Integer resourceOrder,
                                   boolean completed,
                                   String userAnsweredOption, boolean isCorrectlyAnswered, Integer scoreAwarded) {
        super(resourceId, resourceType, resourceXp, resourceOrder, completed);
        this.questionText = questionText;
        this.options = Arrays.asList(option1, option2, option3, option4);
        this.correctAnswerOption = correctAnswerOption;
        this.hint = hint;
        this.userAnsweredOption = userAnsweredOption;
        this.isCorrectlyAnswered = isCorrectlyAnswered;
        this.scoreAwarded = scoreAwarded;
    }

    // Getters
    public String getQuestionText() { return questionText; }
    public List<String> getOptions() { return options; }
    public Integer getCorrectAnswerOption() { return correctAnswerOption; } // Getter for new type
    public String getHint() { return hint; }
    public String getUserAnsweredOption() { return userAnsweredOption; }
    public boolean isCorrectlyAnswered() { return isCorrectlyAnswered; }
    public Integer getScoreAwarded() { return scoreAwarded; }

    // Setters (if needed)
    public void setQuestionText(String questionText) { this.questionText = questionText; }
    public void setOptions(List<String> options) { this.options = options; }
    public void setCorrectAnswerOption(Integer correctAnswerOption) { this.correctAnswerOption = correctAnswerOption; } // Setter for new type
    public void setHint(String hint) { this.hint = hint; }
    public void setUserAnsweredOption(String userAnsweredOption) { this.userAnsweredOption = userAnsweredOption; }
    public void setIsCorrectlyAnswered(boolean correctlyAnswered) { isCorrectlyAnswered = correctlyAnswered; }
    public void setScoreAwarded(Integer scoreAwarded) { this.scoreAwarded = scoreAwarded; }
}