package com.learningplatform.backend.repository.course.roadmap;

import com.learningplatform.backend.model.course.roadmap.UserRoadmapCourse;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRoadmapCourseRepository extends JpaRepository<UserRoadmapCourse, Long> {
}

