package com.learningplatform.backend.repository.course.progress;

import com.learningplatform.backend.model.course.progress.UserLinkedResourceProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserLinkedResourceProgressRepository extends JpaRepository<UserLinkedResourceProgress, Long> {
    List<UserLinkedResourceProgress> findByUserId(Long userId);
}

