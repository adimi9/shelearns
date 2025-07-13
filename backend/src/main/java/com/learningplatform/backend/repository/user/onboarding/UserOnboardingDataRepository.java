package com.learningplatform.backend.repository.user.onboarding;

import com.learningplatform.backend.model.user.User;
import com.learningplatform.backend.model.user.onboarding.UserOnboardingData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserOnboardingDataRepository extends JpaRepository<UserOnboardingData, Long> {
    // This method now finds the UserOnboardingData by the ID of the associated User object.
    Optional<UserOnboardingData> findByUser_Id(Long userId);

    // If you ever need to find by the new primary key (onboardingDataId), you'd use:
    // Optional<UserOnboardingData> findByOnboardingDataId(Long onboardingDataId);
    Optional<UserOnboardingData> findByUser(User user);

    // Method to find UserOnboardingData by the associated User's ID
    // The 'user' property in UserOnboardingData maps to the User entity
    // 'u.id' refers to the primary key of the User entity
    @Query("SELECT uod FROM UserOnboardingData uod WHERE uod.user.id = :userId")
    Optional<UserOnboardingData> findByUserId(@Param("userId") Long userId);
}