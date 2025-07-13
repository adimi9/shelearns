package com.learningplatform.backend.features.profile.overall.service;

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
public class ProfileService {

    private static final Logger logger = LoggerFactory.getLogger(ProfileService.class);

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserOnboardingDataRepository userOnboardingDataRepository;
    private final UserBadgeRepository userBadgeRepository;

    public ProfileService(UserRepository userRepository,
                          UserProfileRepository userProfileRepository,
                          UserOnboardingDataRepository userOnboardingDataRepository,
                          UserBadgeRepository userBadgeRepository) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.userOnboardingDataRepository = userOnboardingDataRepository;
        this.userBadgeRepository = userBadgeRepository;
    }

    @Transactional(readOnly = true)
    public ProfileResponse getUserProfile(Long userId) {
        // 1. Fetch User details (username, email)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.error("User not found with ID: {}", userId);
                    return new IllegalArgumentException("User not found with ID: " + userId);
                });
        logger.debug("Fetched User for ID: {}", userId);

        // 2. Fetch UserProfile details (total XP, avatar)
        UserProfile userProfile = userProfileRepository.findByUser(user)
                .orElseThrow(() -> {
                    logger.error("UserProfile not found for user ID: {}", userId);
                    return new IllegalStateException("UserProfile not found for User ID: " + userId);
                });
        logger.debug("Fetched UserProfile for ID: {}", userId);

        // 3. Fetch Onboarding Data using the User entity
        // You need to add a method to your UserOnboardingDataRepository
        // For example: Optional<UserOnboardingData> findByUser(User user);
        UserOnboardingData onboardingData = userOnboardingDataRepository.findByUser(user)
                .orElse(null);
        logger.debug("Fetched OnboardingData for ID: {}", userId);

        OnboardingDataDto onboardingDataDto = null;
        if (onboardingData != null) {
            List<String> ans4Strings = onboardingData.getAns4().stream()
                                                    .map(UserOnboardingAns4::getAnswerText)
                                                    .collect(Collectors.toList());

            onboardingDataDto = new OnboardingDataDto(
                    onboardingData.getQn1(),
                    onboardingData.getAns1(),
                    onboardingData.getQn2(),
                    onboardingData.getAns2(),
                    onboardingData.getQn3(),
                    onboardingData.getAns3(),
                    onboardingData.getQn4(),
                    ans4Strings
            );
        } else {
            logger.warn("Onboarding data not found for user ID: {}", userId);
        }

        // 4. Fetch Badges
        List<UserBadge> earnedUserBadges = userBadgeRepository.findByUser(user);
        Set<BadgeName> earnedBadgeNames = earnedUserBadges.stream()
                                                            .map(UserBadge::getBadgeName)
                                                            .collect(Collectors.toSet());
        logger.debug("Fetched {} earned badges for user ID: {}", earnedBadgeNames.size(), userId);

        List<BadgeDto> earnedBadgesDto = earnedUserBadges.stream()
                .map(ub -> new BadgeDto(ub.getBadgeName().name(), true))
                .collect(Collectors.toList());

        List<BadgeDto> unearnedBadgesDto = Arrays.stream(BadgeName.values())
                .filter(badgeName -> !earnedBadgeNames.contains(badgeName))
                .map(badgeName -> new BadgeDto(badgeName.name(), false))
                .collect(Collectors.toList());
        logger.debug("Calculated {} unearned badges for user ID: {}", unearnedBadgesDto.size(), userId);


        // 5. Construct and return ProfileResponse
        ProfileResponse response = new ProfileResponse(
                user.getUsername(),
                user.getEmail(),
                userProfile.getTotalXp(),
                userProfile.getAvatarType(),
                onboardingDataDto,
                earnedBadgesDto,
                unearnedBadgesDto
        );

        logger.info("Successfully retrieved profile for user ID: {}", userId);
        return response;
    }
}