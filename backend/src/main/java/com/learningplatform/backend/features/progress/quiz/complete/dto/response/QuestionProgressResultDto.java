package com.learningplatform.backend.features.progress.quiz.complete.dto.response;

public class QuestionProgressResultDto {
    private Long resourceId;
    private String questionText;
    private Integer submittedOption;
    private Integer resourceXp; // ADDED: Field for resource XP
    private Integer correctOption;
    private boolean isCorrect;
    private Integer scoreAwarded;
    private String message;

    // Constructors
    public QuestionProgressResultDto() {
    }

    // UPDATED CONSTRUCTOR: Added resourceXp
    public QuestionProgressResultDto(Long resourceId, String questionText, Integer submittedOption,
                                     Integer resourceXp, Integer correctOption, boolean isCorrect,
                                     Integer scoreAwarded, String message) {
        this.resourceId = resourceId;
        this.questionText = questionText;
        this.submittedOption = submittedOption;
        this.resourceXp = resourceXp; // Assign resourceXp
        this.correctOption = correctOption;
        this.isCorrect = isCorrect;
        this.scoreAwarded = scoreAwarded;
        this.message = message;
    }

    // Getters and Setters (existing ones omitted for brevity, ensure you have them for the new field)
    public Long getResourceId() { return resourceId; }
    public void setResourceId(Long resourceId) { this.resourceId = resourceId; }

    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }

    public Integer getSubmittedOption() { return submittedOption; }
    public void setSubmittedOption(Integer submittedOption) { this.submittedOption = submittedOption; }

    public Integer getResourceXp() { return resourceXp; } // NEW GETTER
    public void setResourceXp(Integer resourceXp) { this.resourceXp = resourceXp; } // NEW SETTER

    public Integer getCorrectOption() { return correctOption; }
    public void setCorrectOption(Integer correctOption) { this.correctOption = correctOption; }

    public boolean isCorrect() { return isCorrect; }
    public void setCorrect(boolean correct) { isCorrect = correct; }

    public Integer getScoreAwarded() { return scoreAwarded; }
    public void setScoreAwarded(Integer scoreAwarded) { this.scoreAwarded = scoreAwarded; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}