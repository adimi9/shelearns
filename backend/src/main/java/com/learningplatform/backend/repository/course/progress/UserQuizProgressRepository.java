package com.learningplatform.backend.repository.course.progress;

import com.learningplatform.backend.model.course.progress.UserQuizProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserQuizProgressRepository extends JpaRepository<UserQuizProgress, Long> {
    List<UserQuizProgress> findByUserId(Long userId);
}

