package com.learningplatform.backend.repository.course.resources;

import com.learningplatform.backend.model.course.resources.VideoResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VideoResourceRepository extends JpaRepository<VideoResource, Integer> {
    // Add custom query methods if needed
}
