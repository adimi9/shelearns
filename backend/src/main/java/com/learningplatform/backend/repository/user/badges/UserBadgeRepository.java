package com.learningplatform.backend.repository.user.badges;

import com.learningplatform.backend.model.user.User;
import com.learningplatform.backend.model.user.badges.enums.BadgeName;
import com.learningplatform.backend.model.user.badges.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {
    Optional<UserBadge> findByUserAndBadgeName(User user, BadgeName badgeName);
    boolean existsByUserAndBadgeName(User user, BadgeName badgeName);
    List<UserBadge> findByUser(User user); // For retrieving all badges for a user

    long countByUserId(Long userId); // Method to count badges for a user
}