package com.learningplatform.backend.features.profile.identity.service;

import com.learningplatform.backend.features.profile.identity.dto.response.IdentityResponse;
import com.learningplatform.backend.features.profile.overall.dto.response.BadgeDto;
import com.learningplatform.backend.features.profile.overall.dto.response.OnboardingDataDto;
import com.learningplatform.backend.features.profile.overall.dto.response.ProfileResponse;
import com.learningplatform.backend.model.user.User;
import com.learningplatform.backend.model.user.onboarding.UserOnboardingAns4;
import com.learningplatform.backend.model.user.onboarding.UserOnboardingData;
import com.learningplatform.backend.model.user.profile.UserProfile;
import com.learningplatform.backend.model.user.badges.UserBadge;
import com.learningplatform.backend.model.user.badges.enums.BadgeName;
import com.learningplatform.backend.repository.user.UserRepository;
import com.learningplatform.backend.repository.user.onboarding.UserOnboardingDataRepository;
import com.learningplatform.backend.repository.user.profile.UserProfileRepository;
import com.learningplatform.backend.repository.user.badges.UserBadgeRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.Arrays;

@Service
public class IdentityService {

    private static final Logger logger = LoggerFactory.getLogger(IdentityService.class);

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    public IdentityService(UserRepository userRepository,
                           UserProfileRepository userProfileRepository) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        logger.info("IdentityService initialized with UserRepository and UserProfileRepository.");
    }

    @Transactional(readOnly = true)
    public IdentityResponse getUserProfile(Long userId) {
        logger.debug("Attempting to retrieve user profile for userId: {}", userId);

        // 1. Fetch User details (username, email)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.error("User not found with ID: {}. Throwing IllegalArgumentException.", userId);
                    return new IllegalArgumentException("User not found with ID: " + userId);
                });
        logger.debug("Successfully fetched User details for ID: {}. Username: {}", userId, user.getUsername());

        // 2. Fetch UserProfile details (total XP, avatar)
        UserProfile userProfile = userProfileRepository.findByUser(user)
                .orElseThrow(() -> {
                    logger.error("UserProfile not found for user ID: {}. Throwing IllegalStateException.", userId);
                    return new IllegalStateException("UserProfile not found for User ID: " + userId);
                });
        logger.debug("Successfully fetched UserProfile for ID: {}. Avatar Type: {}", userId, userProfile.getAvatarType());

        // 3. Construct and return IdentityResponse
        IdentityResponse response = new IdentityResponse(
                user.getUsername(),
                userProfile.getAvatarType()
        );

        logger.info("Successfully constructed IdentityResponse for user ID: {}. Username: {}, Avatar: {}.",
                    userId, response.getUsername(), response.getAvatarType());
        return response;
    }
}