package com.learningplatform.backend.repository.course.progress;

import com.learningplatform.backend.model.course.progress.UserLinkedResourceProgress;
import com.learningplatform.backend.model.user.User;
import com.learningplatform.backend.model.course.resources.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface UserLinkedResourceProgressRepository extends JpaRepository<UserLinkedResourceProgress, Long> {
    // Find progress for a specific user and resource
    Optional<UserLinkedResourceProgress> findByUserAndResource(User user, Resource resource);

    // Find all progress for a specific user
    List<UserLinkedResourceProgress> findByUser(User user);

    // Find all progress for a specific user by their ID
    List<UserLinkedResourceProgress> findByUserId(Long userId); // <--- ADD THIS METHOD

    /**
     * Finds all UserLinkedResourceProgress entries for a specific user and a set of resource IDs.
     * @param userId The ID of the user.
     * @param resourceIds A set of resource IDs to filter by.
     * @return A list of matching UserLinkedResourceProgress entities.
     */
    List<UserLinkedResourceProgress> findByUser_IdAndResource_ResourceIdIn(Long userId, Set<Long> resourceIds);

    // Add this method to resolve the error for early check
    Optional<UserLinkedResourceProgress> findByUserIdAndResource_ResourceId(Long userId, Long resourceId);
}