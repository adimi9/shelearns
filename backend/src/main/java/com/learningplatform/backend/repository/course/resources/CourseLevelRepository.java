package com.learningplatform.backend.repository.course.resources;

import com.learningplatform.backend.model.course.resources.CourseLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseLevelRepository extends JpaRepository<CourseLevel, Long> {
    // add custom queries if needed
}
