package com.learningplatform.backend.repository.course.resources;

import com.learningplatform.backend.model.course.resources.WebResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WebResourceRepository extends JpaRepository<WebResource, Integer> {
    // Add custom query methods if needed
}
