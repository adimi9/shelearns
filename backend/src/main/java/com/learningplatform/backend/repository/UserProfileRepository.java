// File: src/main/java/com/learningplatform/backend/repository/UserProfileRepository.java
package com.learningplatform.backend.repository;

import com.learningplatform.backend.model.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
}