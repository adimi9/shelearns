package com.learningplatform.backend.features.progress.quiz.complete.service;

import com.learningplatform.backend.model.course.progress.UserQuizQuestionProgress;
import com.learningplatform.backend.model.course.resources.QuizResource;
import com.learningplatform.backend.model.user.User;
import com.learningplatform.backend.model.user.profile.UserProfile;
import com.learningplatform.backend.repository.course.progress.UserQuizQuestionProgressRepository;
import com.learningplatform.backend.repository.course.resources.QuizResourceRepository;
import com.learningplatform.backend.repository.user.UserRepository;
import com.learningplatform.backend.repository.user.profile.UserProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.context.ApplicationEventPublisher;
import com.learningplatform.backend.common.events.QuizSubmissionCompletedEvent;
import com.learningplatform.backend.common.events.XpGainedEvent;
import com.learningplatform.backend.features.progress.quiz.complete.dto.request.QuizQuestionAnswerDto;
import com.learningplatform.backend.features.progress.quiz.complete.dto.request.QuizSubmissionRequest;
import com.learningplatform.backend.features.progress.quiz.complete.dto.response.QuestionProgressResultDto;
import com.learningplatform.backend.features.progress.quiz.complete.dto.response.QuizProgressResponse;

@Service
public class QuizProgressService {

    private final UserRepository userRepository;
    private final QuizResourceRepository quizResourceRepository;
    private final UserQuizQuestionProgressRepository userQuizQuestionProgressRepository;
    private final UserProfileRepository userProfileRepository;

    private final ApplicationEventPublisher eventPublisher;

    public QuizProgressService(UserRepository userRepository,
                               QuizResourceRepository quizResourceRepository,
                               UserQuizQuestionProgressRepository userQuizQuestionProgressRepository,
                               UserProfileRepository userProfileRepository,
                               ApplicationEventPublisher eventPublisher) {
        this.userRepository = userRepository;
        this.quizResourceRepository = quizResourceRepository;
        this.userQuizQuestionProgressRepository = userQuizQuestionProgressRepository;
        this.userProfileRepository = userProfileRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public QuizProgressResponse processQuizSubmission(Long userId, QuizSubmissionRequest submissionRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        List<QuestionProgressResultDto> questionResults = new ArrayList<>();
        int totalScore = 0;
        int xpGainedFromThisSubmission = 0; // Accumulator for XP

        UserProfile userProfile = userProfileRepository.findByUser(user)
                .orElseThrow(() -> new IllegalStateException("UserProfile not found for User ID: " + userId));

        // Handle weekly reset BEFORE processing XP for this submission
        handleWeeklyXpResetIfNeeded(userProfile);

        for (QuizQuestionAnswerDto answerDto : submissionRequest.getAnswers()) {
            QuizResource quizResource = quizResourceRepository.findById(answerDto.getResourceId())
                    .orElseThrow(() -> new IllegalArgumentException("Quiz question (Resource) not found with ID: " + answerDto.getResourceId()));

            // Check if this specific quiz resource has already been correctly completed by the user
            Optional<UserQuizQuestionProgress> existingProgress = userQuizQuestionProgressRepository
                    .findByUserAndQuestionResource(user, quizResource);

            boolean wasAlreadyCorrect = existingProgress.isPresent() && existingProgress.get().isCorrect();

            UserQuizQuestionProgress progress = existingProgress.orElseGet(() ->
                    new UserQuizQuestionProgress(user, quizResource)
            );

            progress.setCompleted(true);
            progress.setSelectedOption(String.valueOf(answerDto.getSelectedOption()));

            boolean isCorrect = answerDto.getSelectedOption().equals(quizResource.getCorrectOption());
            progress.setIsCorrect(isCorrect);

            int score = isCorrect ? 1 : 0;
            progress.setScore(score);
            totalScore += score; // Accumulate total score

            userQuizQuestionProgressRepository.save(progress); // Save the updated progress

            // NEW XP Logic: Only add XP if it's correct AND it wasn't already correct before this submission
            if (isCorrect && !wasAlreadyCorrect) {
                int xpFromResource = quizResource.getResourceXp();
                userProfile.setTotalXp(userProfile.getTotalXp() + xpFromResource);
                userProfile.setWeeklyXp(userProfile.getWeeklyXp() + xpFromResource); // <--- ADDED THIS LINE
                xpGainedFromThisSubmission += xpFromResource; // Accumulate for the event
            }

            // Prepare result DTO for the response
            String message = isCorrect ? "Correct!" : "Incorrect. The correct answer was option " + quizResource.getCorrectOption() + ".";
            questionResults.add(new QuestionProgressResultDto(
                    quizResource.getResourceId(),
                    quizResource.getQuestion(),
                    answerDto.getSelectedOption(),
                    quizResource.getResourceXp(), // It's a quiz resource, xp should be here
                    quizResource.getCorrectOption(),
                    isCorrect,
                    score,
                    message
            ));
        }

        // Save the updated UserProfile with the new total and weekly XP *within the same transaction*
        userProfileRepository.save(userProfile);

        QuizProgressResponse response = new QuizProgressResponse(
                userId,
                submissionRequest.getAnswers().size(),
                totalScore,
                questionResults,
                "Quiz submission processed successfully."
        );

        eventPublisher.publishEvent(new QuizSubmissionCompletedEvent(this, userId, response));

        // Publish an XpGainedEvent *after* updating the profile
        if (xpGainedFromThisSubmission > 0) {
            eventPublisher.publishEvent(new XpGainedEvent(this, userId, xpGainedFromThisSubmission, userProfile.getTotalXp(), userProfile.getWeeklyXp()));
        }

        return response;
    }

    private void handleWeeklyXpResetIfNeeded(UserProfile userProfile) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfCurrentWeek = userProfile.getStartOfCurrentWeekStatic(now);

        if (userProfile.getLastWeeklyResetTime().isBefore(startOfCurrentWeek)) {
            userProfile.setWeeklyXp(0);
            userProfile.setLastWeeklyResetTime(startOfCurrentWeek);
            // No need to explicitly save userProfile here, as it's managed within the same @Transactional method
            // and will be saved when the main `processQuizSubmission` method completes.
        }
    }
}