// src/main/java/com/learningplatform/backend/repository/RoleRepository.java
package com.learningplatform.backend.repository;

import com.learningplatform.backend.model.Role;
import com.learningplatform.backend.model.enums.ERole; // Import ERole
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional; // Import Optional

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {
    // Custom method to find a Role by its name (e.g., ROLE_USER)
    Optional<Role> findByName(ERole name);
}