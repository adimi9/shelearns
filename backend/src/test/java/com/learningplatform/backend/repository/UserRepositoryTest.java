// src/test/java/com/learningplatform/backend/repository/UserRepositoryTest.java
package com.learningplatform.backend.repository;

import com.learningplatform.backend.model.User;
import com.learningplatform.backend.model.UserProfile;
import com.learningplatform.backend.model.enums.EAvatar;

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

import java.util.Optional;

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
    // REMOVED: @Autowired private RoleRepository roleRepository; // Not needed for Option A
    // REMOVED: @Autowired private AvatarRepository avatarRepository; // Not needed for Option A

    private User user1;
    private User user2;
    // REMOVED: private Role userRole; // Not needed for Option A
    // REMOVED: private Avatar defaultAvatar; // Not needed for Option A

    @BeforeEach
    void setUp() {
        userRepository.deleteAll(); // Clean DB before each test

        // No need to set up Role or Avatar entities as they are not used in JPA mapping for User/UserProfile

        // User constructor: public User(String name, String email, String passwordHash)
        user1 = new User("John Doe", "john.doe@example.com", "hashedPassword1");
        // UserProfile constructor: public UserProfile(EAvatar avatar)
        user1.setUserProfile(new UserProfile(EAvatar.AVATAR_TECH_GIRL));
        userRepository.save(user1);

        user2 = new User("Jane Smith", "jane.smith@example.com", "hashedPassword2");
        user2.setUserProfile(new UserProfile(EAvatar.AVATAR_TECH_GIRL));
        userRepository.save(user2);
    }

    @Test
    @DisplayName("Should find user by email when email exists")
    void shouldFindUserByEmailWhenExists() {
        Optional<User> foundUser = userRepository.findByEmail("john.doe@example.com");
        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getEmail()).isEqualTo("john.doe@example.com");
        // REMOVED: Assertions for user roles, as User does not have a Role field
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
        User newUser = new User("New User", "new@example.com", "newHashedPass");
        newUser.setUserProfile(new UserProfile(EAvatar.AVATAR_TECH_GIRL)); // Set UserProfile

        User savedUser = userRepository.save(newUser);
        assertThat(savedUser.getId()).isNotNull();
        assertThat(savedUser.getName()).isEqualTo("New User");
        assertThat(userRepository.findByEmail("new@example.com")).isPresent();
        // REMOVED: Assertions for user roles, as User does not have a Role field
    }

    @Test
    @DisplayName("Should return true when name exists")
    void shouldReturnTrueWhenNameExists() {
        boolean exists = userRepository.existsByName("John Doe");
        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("Should return false when name does not exist")
    void shouldReturnFalseWhenNameDoesNotExist() {
        boolean exists = userRepository.existsByName("Non Existent Name");
        assertThat(exists).isFalse();
    }

    // REMOVED: @Test shouldFindUsersByRole() as User no longer has a Role field for querying by
}