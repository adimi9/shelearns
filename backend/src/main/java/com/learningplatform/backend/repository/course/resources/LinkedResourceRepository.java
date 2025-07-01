package com.learningplatform.backend.repository.course.resources;

import com.learningplatform.backend.model.course.resources.LinkedResource;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LinkedResourceRepository extends JpaRepository<LinkedResource, String> {
}

