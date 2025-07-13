package com.learningplatform.backend.repository.course.resources;

import com.learningplatform.backend.model.course.resources.Course;
import com.learningplatform.backend.model.course.resources.CourseLevel;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

// return types
import java.util.Optional;


@Repository
public interface CourseRepository extends JpaRepository<Course, String> {
    Optional<Course> findByCourseId(String courseId);

    // NEW METHOD: Find CourseLevel by its ID
    @Query("SELECT cl FROM CourseLevel cl WHERE cl.levelId = :courseLevelId")
    Optional<CourseLevel> findCourseLevelById(@Param("courseLevelId") Long courseLevelId);
}
