package com.learningplatform.backend.features.progress.quiz.tryagain.controller;

import com.learningplatform.backend.features.progress.quiz.tryagain.dto.request.QuizResetRequest;
import com.learningplatform.backend.features.progress.quiz.tryagain.dto.response.QuizResetResponse;
import com.learningplatform.backend.features.progress.quiz.tryagain.service.QuizResetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress/quiz/reset") // Unique and descriptive path
public class QuizResetController {

    private final QuizResetService quizResetService;

    public QuizResetController(QuizResetService quizResetService) {
        this.quizResetService = quizResetService;
    }

    @PutMapping // Using PUT as it's an update operation to existing resources
    public ResponseEntity<QuizResetResponse> resetQuizProgress(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody QuizResetRequest request) {

        QuizResetResponse response = quizResetService.resetQuizProgress(userId, request);
        return ResponseEntity.ok(response);
    }
}