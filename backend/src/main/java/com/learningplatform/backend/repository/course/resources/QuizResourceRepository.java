package com.learningplatform.backend.repository.course.resources;

import com.learningplatform.backend.model.course.resources.QuizResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuizResourceRepository extends JpaRepository<QuizResource, Integer> {
    // Add custom queries if needed
}
