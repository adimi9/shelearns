package com.learningplatform.backend.repository.course.resources;

import com.learningplatform.backend.model.course.resources.Course;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, String> {
}
