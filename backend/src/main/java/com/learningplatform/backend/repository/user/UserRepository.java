package com.learningplatform.backend.repository.user;

import com.learningplatform.backend.model.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);
    boolean existsByUsername(String username);


    /**
     * Fetches User ID, Username, and UserProfile's Weekly XP for all users
     * whose onboarding 'ans1' matches the given value.
     * Orders the results by weekly XP in descending order.
     *
     * @param ans1 The 'ans1' value to filter by.
     * @return A list of Object arrays, where each array contains [userId, username, weeklyXp].
     */
    @Query("SELECT u.id, u.username, up.weeklyXp, up.avatarType " +
           "FROM User u " +
           "JOIN UserOnboardingData uod ON u.id = uod.user.id " + // Join User with UserOnboardingData
           "JOIN UserProfile up ON u.id = up.user.id " + // Join User with UserProfile
           "WHERE uod.ans1 = :ans1") // Filter by ans1 from UserOnboardingData
    List<Object[]> findAllUsersByOnboardingAns1(@Param("ans1") String ans1);
}
