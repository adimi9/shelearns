package com.learningplatform.repositories;

import com.learningplatform.models.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    // Spring Data JPA automatically provides findAll(), findById(), save(), etc.
}
