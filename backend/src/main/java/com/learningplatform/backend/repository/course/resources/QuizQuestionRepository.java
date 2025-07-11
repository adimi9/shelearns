package com.learningplatform.backend.repository.course.resources;

import com.learningplatform.backend.model.course.resources.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Integer> {
    // Add custom queries if needed
}
