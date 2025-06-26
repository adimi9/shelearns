package com.learningplatform.backend.config;

import com.learningplatform.backend.model.Avatar;
import com.learningplatform.backend.model.Role;
import com.learningplatform.backend.model.enums.EAvatar;
import com.learningplatform.backend.model.enums.ERole;
import com.learningplatform.backend.repository.AvatarRepository; // NEW: Import AvatarRepository
import com.learningplatform.backend.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.slf4j.Logger; // NEW: For logging
import org.slf4j.LoggerFactory; // NEW: For logging

@Configuration // Marks this class as a source of bean definitions
public class DataInitializer { // Consistent naming: DataInitializer

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class); // NEW: Logger instance

    @Bean // Defines a Spring Bean that implements CommandLineRunner
    CommandLineRunner initEssentialData(RoleRepository roleRepository, AvatarRepository avatarRepository) { // Renamed and added AvatarRepository
        return args -> {
            logger.info("Initializing essential data (Roles and Avatars)..."); // Improved logging

            // 1. Initialize Roles
            for (ERole roleName : ERole.values()) {
                roleRepository.findByName(roleName)
                    .ifPresentOrElse(
                        role -> logger.info("Role '{}' already exists.", roleName), // Using logger
                        () -> {
                            roleRepository.save(new Role(roleName));
                            logger.info("Saved Role: '{}'", roleName); // Using logger
                        }
                    );
            }

            // 2. Initialize Avatars
            for (EAvatar avatarName : EAvatar.values()) {
                avatarRepository.findByName(avatarName)
                    .ifPresentOrElse(
                        avatar -> logger.info("Avatar '{}' already exists.", avatarName), // Using logger
                        () -> {
                            avatarRepository.save(new Avatar(avatarName));
                            logger.info("Saved Avatar: '{}'", avatarName); // Using logger
                        }
                    );
            }

            logger.info("Essential data initialization complete."); // Improved logging
        };
    }
}