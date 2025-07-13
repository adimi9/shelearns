// 📁 UserRoadmapRepository.java
package com.learningplatform.backend.repository.course.roadmap;

import com.learningplatform.backend.model.course.roadmap.UserRoadmap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository; // It's good practice to add @Repository

import java.util.Optional; // Don't forget to import Optional

@Repository // Good practice
public interface UserRoadmapRepository extends JpaRepository<UserRoadmap, Long> {

    // Corrected: Added the findByUserId method
    Optional<UserRoadmap> findByUserId(Long userId);
}