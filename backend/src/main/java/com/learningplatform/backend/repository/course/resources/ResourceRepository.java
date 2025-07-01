package com.learningplatform.backend.repository.course.resources;

import com.learningplatform.backend.model.course.resources.Resource;
import com.learningplatform.backend.model.course.resources.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    @Query("SELECT COUNT(r) FROM Resource r WHERE r.course.courseId = :courseId AND r.resourceType = :type")
    Long countByCourseIdAndType(String courseId, String type);

    @Query("SELECT SUM(r.resourceXP) FROM Resource r WHERE r.course.courseId = :courseId")
    Integer sumXPByCourseId(String courseId);
}
