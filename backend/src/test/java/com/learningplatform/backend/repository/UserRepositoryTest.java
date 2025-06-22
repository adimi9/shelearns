// src/test/java/com/learningplatform/backend/repository/UserRepositoryTest.java
package com.learningplatform.backend.repository;

import com.learningplatform.backend.model.User;
import com.learningplatform.backend.model.Role; // NEW Import
import com.learningplatform.backend.model.enums.ERole; // NEW Import
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDateTime;
import java.util.HashSet; // NEW Import
import java.util.Optional;
import java.util.Set; // NEW Import

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Testcontainers
class UserRepositoryTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16.2")
            .withDatabaseName("testdb")
            .withUsername("testuser")
            .withPassword("testpass");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private UserRepository userRepository;
    @Autowired // NEW: Inject RoleRepository for setting up roles
    private RoleRepository roleRepository;

    private User user1;
    private User user2;
    private Role userRole; // NEW: To hold the ROLE_USER object

    @BeforeEach
    void setUp() {
        userRepository.deleteAll(); // Clean DB before each test

        // NEW: Ensure roles are in the database for the tests
        if (roleRepository.findByName(ERole.ROLE_USER).isEmpty()) {
            userRole = roleRepository.save(new Role(ERole.ROLE_USER));
        } else {
            userRole = roleRepository.findByName(ERole.ROLE_USER).get();
        }
        // You might also add ROLE_ADMIN here if needed for other tests

        Set<Role> defaultRoles = new HashSet<>();
        defaultRoles.add(userRole); // Assign the default user role

        // Update User constructor calls to include roles
        user1 = new User("John Doe", "john.doe@example.com", "hashedPassword1", defaultRoles); // Added roles
        user1.setCreatedAt(LocalDateTime.now().minusDays(5));
        userRepository.save(user1);

        user2 = new User("Jane Smith", "jane.smith@example.com", "hashedPassword2", defaultRoles); // Added roles
        user2.setCreatedAt(LocalDateTime.now().minusDays(2));
        userRepository.save(user2);
    }

    @Test
    @DisplayName("Should find user by email when email exists")
    void shouldFindUserByEmailWhenExists() {
        Optional<User> foundUser = userRepository.findByEmail("john.doe@example.com");
        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getEmail()).isEqualTo("john.doe@example.com");
        assertThat(foundUser.get().getRoles()).containsExactlyInAnyOrder(userRole); // NEW: Assert roles
    }

    @Test
    @DisplayName("Should not find user by email when email does not exist")
    void shouldNotFindUserByEmailWhenDoesNotExist() {
        Optional<User> foundUser = userRepository.findByEmail("nonexistent@example.com");
        assertThat(foundUser).isNotPresent();
    }

    @Test
    @DisplayName("Should return true when email exists")
    void shouldReturnTrueWhenEmailExists() {
        boolean exists = userRepository.existsByEmail("jane.smith@example.com");
        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("Should return false when email does not exist")
    void shouldReturnFalseWhenEmailDoesNotExist() {
        boolean exists = userRepository.existsByEmail("newuser@example.com");
        assertThat(exists).isFalse();
    }

    @Test
    @DisplayName("Should save a new user")
    void shouldSaveNewUser() {
        Set<Role> newRoles = new HashSet<>();
        newRoles.add(userRole); // Assign default user role

        User newUser = new User("New User", "new@example.com", "newHashedPass", newRoles); // Added roles
        User savedUser = userRepository.save(newUser);
        assertThat(savedUser.getId()).isNotNull();
        assertThat(savedUser.getName()).isEqualTo("New User");
        assertThat(userRepository.findByEmail("new@example.com")).isPresent();
        assertThat(savedUser.getRoles()).containsExactlyInAnyOrder(userRole); // NEW: Assert roles
    }
}