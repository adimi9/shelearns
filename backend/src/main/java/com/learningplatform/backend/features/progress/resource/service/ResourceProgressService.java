package com.learningplatform.backend.features.progress.resource.service;

import com.learningplatform.backend.features.progress.resource.dto.response.ResourceProgressResponse;
import com.learningplatform.backend.model.course.progress.UserLinkedResourceProgress;
import com.learningplatform.backend.model.course.resources.Resource;
import com.learningplatform.backend.model.user.User;
import com.learningplatform.backend.model.user.profile.UserProfile; // Import UserProfile
import com.learningplatform.backend.repository.course.resources.ResourceRepository;
import com.learningplatform.backend.repository.course.progress.UserLinkedResourceProgressRepository;
import com.learningplatform.backend.repository.user.UserRepository;
import com.learningplatform.backend.repository.user.profile.UserProfileRepository; // Import UserProfileRepository
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// entities
// import com.learningplatform.backend.model.course.resources.Resource; // Redundant import, already imported above

import java.time.LocalDateTime;
import java.util.Optional;

// events
import org.springframework.context.ApplicationEventPublisher;
import com.learningplatform.backend.common.events.ResourceProgressUpdatedEvent;
import com.learningplatform.backend.common.events.XpGainedEvent;

@Service
public class ResourceProgressService {

    private final UserLinkedResourceProgressRepository userLinkedResourceProgressRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final UserProfileRepository userProfileRepository;

    private final ApplicationEventPublisher eventPublisher;

    public ResourceProgressService(UserLinkedResourceProgressRepository userLinkedResourceProgressRepository,
                                   UserRepository userRepository,
                                   ResourceRepository resourceRepository,
                                   UserProfileRepository userProfileRepository,
                                   ApplicationEventPublisher eventPublisher) {
        this.userLinkedResourceProgressRepository = userLinkedResourceProgressRepository;
        this.userRepository = userRepository;
        this.resourceRepository = resourceRepository;
        this.userProfileRepository = userProfileRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public ResourceProgressResponse updateResourceCompletionStatus(Long userId, Long resourceId, boolean completionStatus) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found with ID: " + resourceId));

        UserProfile userProfile = userProfileRepository.findByUser(user)
                .orElseThrow(() -> new IllegalStateException("UserProfile not found for User ID: " + userId));

        // --- NEW: Check for weekly reset before processing XP ---
        handleWeeklyXpResetIfNeeded(userProfile);

        Optional<UserLinkedResourceProgress> existingProgressOpt = userLinkedResourceProgressRepository
                .findByUserAndResource(user, resource);

        // Check if the resource was already completed before this update
        boolean wasAlreadyCompleted = existingProgressOpt.isPresent() && existingProgressOpt.get().isCompletionStatus();


        UserLinkedResourceProgress progress = existingProgressOpt
                .orElseGet(() -> {
                    // If no progress exists, create a new one
                    UserLinkedResourceProgress newProgress = new UserLinkedResourceProgress();
                    newProgress.setUser(user);
                    newProgress.setResource(resource);
                    return newProgress;
                });

        progress.setCompletionStatus(completionStatus);
        UserLinkedResourceProgress savedProgress = userLinkedResourceProgressRepository.save(progress);

        // --- FIX: Initialize xpGainedFromThisSubmission correctly ---
        int xpGainedFromThisSubmission = 0;

        // NEW XP Logic: Only add XP if it's now completed AND it wasn't already completed before
        if (completionStatus && !wasAlreadyCompleted) {
            int xpFromResource = resource.getResourceXp();
            userProfile.setTotalXp(userProfile.getTotalXp() + xpFromResource);
            userProfile.setWeeklyXp(userProfile.getWeeklyXp() + xpFromResource); // <--- THIS IS THE KEY LINE YOU MISSED
            xpGainedFromThisSubmission = xpFromResource; // Assign the actual XP gained

            // Save the updated UserProfile with the new total and weekly XP *within the same transaction*
            userProfileRepository.save(userProfile);

            // Publish XpGainedEvent
            // Ensure xpGainedFromThisSubmission is greater than 0 before publishing the event
            if (xpGainedFromThisSubmission > 0) {
                eventPublisher.publishEvent(new XpGainedEvent(this, userId, xpGainedFromThisSubmission, userProfile.getTotalXp(), userProfile.getWeeklyXp()));
            }
        }

        // Publish the original ResourceProgressUpdatedEvent (as before)
        eventPublisher.publishEvent(new ResourceProgressUpdatedEvent(this, userId, resourceId, completionStatus));

        return new ResourceProgressResponse(
                savedProgress.getId(),
                savedProgress.getUser().getId(),
                savedProgress.getResource().getResourceId(),
                savedProgress.isCompletionStatus(),
                "Resource completion status updated successfully."
        );
    }

    // --- Helper method for weekly XP reset ---
    private void handleWeeklyXpResetIfNeeded(UserProfile userProfile) {
        LocalDateTime now = LocalDateTime.now();
        // Assuming getStartOfCurrentWeekStatic calculates the start of the week (e.g., Sunday 00:00:00)
        LocalDateTime startOfCurrentWeek = userProfile.getStartOfCurrentWeekStatic(now);

        // Check if the last weekly reset time is before the start of the current week
        // This handles cases where the user hasn't logged in since the last reset or the reset just occurred.
        if (userProfile.getLastWeeklyResetTime().isBefore(startOfCurrentWeek)) {
            userProfile.setWeeklyXp(0);
            userProfile.setLastWeeklyResetTime(startOfCurrentWeek);
            // The userProfile will be saved by the main updateResourceCompletionStatus method
            // because it's managed within the same transaction.
        }
    }
}