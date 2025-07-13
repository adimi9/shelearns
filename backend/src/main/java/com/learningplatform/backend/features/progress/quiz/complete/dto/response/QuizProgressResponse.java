package com.learningplatform.backend.features.progress.quiz.complete.dto.response;

import java.util.List;

public class QuizProgressResponse {
    private Long userId;
    private Integer totalQuestionsAttempted;
    private Integer totalScore;
    private List<QuestionProgressResultDto> questionResults;
    private String overallMessage; // e.g., "Quiz completed successfully!"

    // Constructors
    public QuizProgressResponse() {
    }

    public QuizProgressResponse(Long userId, Integer totalQuestionsAttempted, Integer totalScore, List<QuestionProgressResultDto> questionResults, String overallMessage) {
        this.userId = userId;
        this.totalQuestionsAttempted = totalQuestionsAttempted;
        this.totalScore = totalScore;
        this.questionResults = questionResults;
        this.overallMessage = overallMessage;
    }

    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Integer getTotalQuestionsAttempted() { return totalQuestionsAttempted; }
    public void setTotalQuestionsAttempted(Integer totalQuestionsAttempted) { this.totalQuestionsAttempted = totalQuestionsAttempted; }

    public Integer getTotalScore() { return totalScore; }
    public void setTotalScore(Integer totalScore) { this.totalScore = totalScore; }

    public List<QuestionProgressResultDto> getQuestionResults() { return questionResults; }
    public void setQuestionResults(List<QuestionProgressResultDto> questionResults) { this.questionResults = questionResults; }

    public String getOverallMessage() { return overallMessage; }
    public void setOverallMessage(String overallMessage) { this.overallMessage = overallMessage; }
}