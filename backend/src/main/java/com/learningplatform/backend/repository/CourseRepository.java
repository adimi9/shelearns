// File: src/main/java/com/learningplatform/backend/repository/CourseRepository.java
package com.learningplatform.backend.repository;

import com.learningplatform.backend.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CourseRepository extends JpaRepository<Course, String> {
    // JpaRepository already provides findAllById(Iterable<ID> ids)
}