package com.learningplatform.backend.repository.course.resources;

import com.learningplatform.backend.model.course.resources.Resource;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    // Add custom query methods if needed

    /**
     * Finds all resources associated with a specific CourseLevel ID.
     * The naming convention matches the 'courseLevel' field in Resource
     * and the 'levelId' field within the CourseLevel entity.
     * @param levelId The ID of the CourseLevel.
     * @return A list of resources belonging to that level.
     */
    List<Resource> findByCourseLevel_LevelId(Long levelId); // <--- ADD THIS METHOD
}
