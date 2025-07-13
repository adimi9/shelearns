package com.learningplatform.backend.features.progress.quiz.complete.controller;

import com.learningplatform.backend.features.progress.quiz.complete.dto.request.QuizSubmissionRequest;
import com.learningplatform.backend.features.progress.quiz.complete.dto.response.QuizProgressResponse;
import com.learningplatform.backend.features.progress.quiz.complete.service.QuizProgressService;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress/quiz")
public class QuizProgressController {

    private final QuizProgressService quizProgressService;

    public QuizProgressController(QuizProgressService quizProgressService) {
        this.quizProgressService = quizProgressService;
    }

    @PutMapping // Changed from @PostMapping to @PutMapping for idempotency
    public ResponseEntity<QuizProgressResponse> submitQuizAnswers(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody QuizSubmissionRequest request) {
        
        QuizProgressResponse response = quizProgressService.processQuizSubmission(userId, request);
        return ResponseEntity.ok(response);
    }
}