package com.learningplatform.backend.repository.course.resources;

import com.learningplatform.backend.model.course.resources.CourseLevel;
import com.learningplatform.backend.model.course.resources.enums.LevelName;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CourseLevelRepository extends JpaRepository<CourseLevel, Long> {
    // Spring Data JPA will automatically implement this based on the naming convention
    Optional<CourseLevel> findById(Long levelId);

    Optional<CourseLevel> findByCourse_CourseIdAndLevelName(String courseId, LevelName levelName);
}
