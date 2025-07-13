package com.learningplatform.backend.repository.user.profile;

import com.learningplatform.backend.model.user.User;
import com.learningplatform.backend.model.user.profile.UserProfile;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    Optional<UserProfile> findByUser(User user);
    Optional<UserProfile> findByUserId(Long userId);
}
