package com.learningplatform.backend.repository.course.progress;

import com.learningplatform.backend.model.course.progress.UserQuizQuestionProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserQuizQuestionProgressRepository extends JpaRepository<UserQuizQuestionProgress, Long> {
    List<UserQuizQuestionProgress> findByUserId(Long userId);
}

