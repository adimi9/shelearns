package com.learningplatform.backend.common.events;

import org.springframework.context.ApplicationEvent;

import com.learningplatform.backend.features.progress.quiz.complete.dto.response.QuizProgressResponse;

public class QuizSubmissionCompletedEvent extends ApplicationEvent {
    private final Long userId;
    private final QuizProgressResponse quizProgressResponse; // Pass the full response for badge logic

    public QuizSubmissionCompletedEvent(Object source, Long userId, QuizProgressResponse quizProgressResponse) {
        super(source);
        this.userId = userId;
        this.quizProgressResponse = quizProgressResponse;
    }

    public Long getUserId() { return userId; }
    public QuizProgressResponse getQuizProgressResponse() { return quizProgressResponse; }
}
