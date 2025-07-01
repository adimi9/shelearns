package com.learningplatform.backend.repository.user.profile;

import com.learningplatform.backend.model.user.profile.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
}
