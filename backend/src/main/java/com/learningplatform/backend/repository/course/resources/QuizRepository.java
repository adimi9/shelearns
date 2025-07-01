package com.learningplatform.backend.repository.course.resources;

import com.learningplatform.backend.model.course.resources.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByResourceResourceId(Long resourceId);

}

