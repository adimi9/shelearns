// Example: src/main/java/com/learningplatform/backend/config/DataInitializer.java (or similar)
package com.learningplatform.backend.config;

import com.learningplatform.backend.model.Role;
import com.learningplatform.backend.model.enums.ERole;
import com.learningplatform.backend.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitialiser {

    @Bean
    CommandLineRunner initRoles(RoleRepository roleRepository) {
        return args -> {
            // Check if ROLE_USER exists, if not, create it
            if (roleRepository.findByName(ERole.ROLE_USER).isEmpty()) {
                roleRepository.save(new Role(ERole.ROLE_USER));
                System.out.println("ROLE_USER added to database.");
            }

            // Check if ROLE_ADMIN exists, if not, create it
            if (roleRepository.findByName(ERole.ROLE_ADMIN).isEmpty()) {
                roleRepository.save(new Role(ERole.ROLE_ADMIN));
                System.out.println("ROLE_ADMIN added to database.");
            }
        };
    }
}