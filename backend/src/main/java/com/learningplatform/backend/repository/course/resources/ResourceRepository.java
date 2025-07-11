package com.learningplatform.backend.repository.course.resources;

import com.learningplatform.backend.model.course.resources.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Integer> {
    // Add custom query methods if needed
}
