package com.learningplatform.backend.repository.course.resources;

import com.learningplatform.backend.model.course.resources.QuizResource;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuizResourceRepository extends JpaRepository<QuizResource, Long> {
    /**
     * Finds all QuizResource entities associated with a specific CourseLevel ID.
     * This leverages the 'courseLevel' relationship inherited from the 'Resource' parent entity.
     *
     * @param levelId The ID of the CourseLevel.
     * @return A list of QuizResource entities.
     */
    List<QuizResource> findByCourseLevel_LevelId(Long levelId);
}
