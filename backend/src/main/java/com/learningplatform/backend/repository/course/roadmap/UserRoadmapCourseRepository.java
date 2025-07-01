package com.learningplatform.backend.repository.course.roadmap;

import com.learningplatform.backend.model.course.roadmap.UserRoadmapCourse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRoadmapCourseRepository extends JpaRepository<UserRoadmapCourse, Long> {
    List<UserRoadmapCourse> findByUserId(Long userId);
}

