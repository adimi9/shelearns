package com.learningplatform.backend.repository.course.progress;

import com.learningplatform.backend.model.course.progress.UserQuizQuestionProgress;
import com.learningplatform.backend.model.user.User;
import com.learningplatform.backend.model.course.resources.QuizResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface UserQuizQuestionProgressRepository extends JpaRepository<UserQuizQuestionProgress, Long> {
    // Find progress for a specific user and quiz question resource
    Optional<UserQuizQuestionProgress> findByUserAndQuestionResource(User user, QuizResource questionResource);

    // Find all quiz progress for a specific user
    List<UserQuizQuestionProgress> findByUser(User user);

    /**
     * Finds all UserQuizQuestionProgress entries for a specific user and a set of QuizResource IDs.
     * @param userId The ID of the user.
     * @param questionResourceIds A set of QuizResource IDs to filter by.
     * @return A list of matching UserQuizQuestionProgress entities.
     */
    List<UserQuizQuestionProgress> findByUser_IdAndQuestionResource_ResourceIdIn(Long userId, Set<Long> questionResourceIds);

    // To get the latest attempt for a specific user and quiz question
    // This is a more complex query, typically requires ORDER BY and LIMIT 1
    // For simplicity, we'll just get all for now and pick the last one in service,
    // or you can add a more specific query if needed for 'latest attempt'
    List<UserQuizQuestionProgress> findByUserIdAndQuestionResource_ResourceIdOrderByCompletedDescIdDesc(Long userId, Long quizResourceId);

    // Add this method to resolve the error for early check
    List<UserQuizQuestionProgress> findByUser_IdAndQuestionResource_ResourceId(Long userId, Long resourceId);

    // Add this new method to find progress by user and resource ID
    @Query("SELECT uqpp FROM UserQuizQuestionProgress uqpp WHERE uqpp.user = :user AND uqpp.questionResource.resourceId = :resourceId")
    List<UserQuizQuestionProgress> findByUserAndQuestionResource_ResourceId(@Param("user") User user, @Param("resourceId") Long resourceId);
}