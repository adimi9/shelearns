package com.learningplatform.backend.features.progress.quiz.tryagain.service;

import com.learningplatform.backend.features.progress.quiz.tryagain.dto.request.QuizResetRequest;
import com.learningplatform.backend.features.progress.quiz.tryagain.dto.response.QuizResetResponse;
import com.learningplatform.backend.model.course.progress.UserQuizQuestionProgress;
import com.learningplatform.backend.model.user.User;
import com.learningplatform.backend.repository.course.progress.UserQuizQuestionProgressRepository;
import com.learningplatform.backend.repository.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuizResetService {

    private final UserRepository userRepository;
    private final UserQuizQuestionProgressRepository userQuizQuestionProgressRepository;

    public QuizResetService(UserRepository userRepository,
                            UserQuizQuestionProgressRepository userQuizQuestionProgressRepository) {
        this.userRepository = userRepository;
        this.userQuizQuestionProgressRepository = userQuizQuestionProgressRepository;
    }

    @Transactional
    public QuizResetResponse resetQuizProgress(Long userId, QuizResetRequest request) {
        // 1. Find the User
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        List<Long> successfullyResetResourceIds = new ArrayList<>();
        int resetCount = 0;

        // 2. Iterate through the requested resource IDs
        for (Long resourceId : request.getResourceIds()) {
            // 3. Find the user's progress for each quiz question
            // We need to find by user AND resourceId, as UserQuizQuestionProgress links them.
            // Note: In your existing QuizProgressService, you find by User and QuizResource object.
            // Here, we might need a custom repository method if we want to find by resourceId directly,
            // or fetch the QuizResource first. Let's assume a method `findByUserAndQuizResource_ResourceId`
            // is available or we adjust the query.
            // For simplicity, let's fetch by user and then filter, or add a custom query to the repository.
            // A more efficient way would be to fetch all progress for the user for the given resource IDs in one go.

            // Option A: Find individual progress entries (simpler for small lists, more DB calls)
            List<UserQuizQuestionProgress> progressEntries = userQuizQuestionProgressRepository
                    .findByUserAndQuestionResource_ResourceId(user, resourceId);

            if (!progressEntries.isEmpty()) {
                // If there's progress (there should ideally be only one entry per user-question pair)
                UserQuizQuestionProgress progress = progressEntries.get(0); // Assuming one-to-one or taking the first

                // 4. Reset the status
                progress.setCompleted(false);
                progress.setIsCorrect(false);
                progress.setScore(0);
                progress.setSelectedOption(null); // Clear selected option

                userQuizQuestionProgressRepository.save(progress); // Save the updated progress
                successfullyResetResourceIds.add(resourceId);
                resetCount++;
            } else {
                // Log or handle cases where no progress is found for a given resourceId
                System.out.println("No existing progress found for user " + userId + " and quiz resource " + resourceId);
            }
        }

        String message = String.format("Successfully reset progress for %d out of %d quiz questions.",
                resetCount, request.getResourceIds().size());

        return new QuizResetResponse(userId, successfullyResetResourceIds, message, resetCount);
    }
}