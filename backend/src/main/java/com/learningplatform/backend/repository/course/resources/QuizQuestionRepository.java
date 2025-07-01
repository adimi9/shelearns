package com.learningplatform.backend.repository.course.resources;

import com.learningplatform.backend.model.course.resources.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, String> {
}

