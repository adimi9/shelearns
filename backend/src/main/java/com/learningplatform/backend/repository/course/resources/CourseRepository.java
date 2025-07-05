package com.learningplatform.backend.repository.course.resources;

import com.learningplatform.backend.model.course.resources.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseRepository extends JpaRepository<Course, String> {
    // You can add custom query methods here if needed
}
