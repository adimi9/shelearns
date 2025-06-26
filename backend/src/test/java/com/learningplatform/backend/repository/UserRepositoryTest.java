// src/test/java/com/learningplatform/backend/repository/UserRepositoryTest.java
package com.learningplatform.backend.repository;

import com.learningplatform.backend.model.User;
import com.learningplatform.backend.model.Role;
import com.learningplatform.backend.model.UserProfile; // NEW: Needed if User constructor now initializes UserProfile
import com.learningplatform.backend.model.Avatar;     // NEW: Needed if User constructor now initializes UserProfile/Avatar
import com.learningplatform.backend.model.enums.EAvatar; // NEW: Needed if User constructor now initializes UserProfile/Avatar
import com.learningplatform.backend.model.enums.ERole;
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

import java.util.List;
import java.util.Optional;
// import java.time.LocalDateTime; // REMOVED: No longer setting createdAt manually

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
    @Autowired
    private RoleRepository roleRepository;
    @Autowired // NEW: Inject AvatarRepository to set up default avatars if needed
    private AvatarRepository avatarRepository;

    private User user1;
    private User user2;
    private Role userRole;
    private Avatar defaultAvatar; // NEW: To hold the default avatar object

    @BeforeEach
    void setUp() {
        userRepository.deleteAll(); // Clean DB before each test
        roleRepository.deleteAll(); // Ensure roles are clean too if not using a fixed set of roles
        avatarRepository.deleteAll(); // Ensure avatars are clean too

        // Ensure roles are in the database for the tests
        Optional<Role> existingUserRole = roleRepository.findByName(ERole.ROLE_USER);
        if (existingUserRole.isEmpty()) {
            userRole = roleRepository.save(new Role(ERole.ROLE_USER));
        } else {
            userRole = existingUserRole.get();
        }
        // You might also add ROLE_ADMIN here if needed for other tests
        // Example for admin role:
        // Optional<Role> existingAdminRole = roleRepository.findByName(ERole.ROLE_ADMIN);
        // if (existingAdminRole.isEmpty()) {
        //     roleRepository.save(new Role(ERole.ROLE_ADMIN));
        // }

        // Ensure default avatar exists
        Optional<Avatar> existingDefaultAvatar = avatarRepository.findByName(EAvatar.AVATAR_TECH_GIRL);
        if (existingDefaultAvatar.isEmpty()) {
            defaultAvatar = avatarRepository.save(new Avatar(EAvatar.AVATAR_TECH_GIRL));
        } else {
            defaultAvatar = existingDefaultAvatar.get();
        }


        // --- FIX: User constructor now takes a single Role, and no setCreatedAt() ---
        user1 = new User("John Doe", "john.doe@example.com", "hashedPassword1", userRole); // Pass single role
        // user1.setCreatedAt(LocalDateTime.now().minusDays(5)); // REMOVED: This method is likely gone
        user1.setUserProfile(new UserProfile(defaultAvatar)); // Set UserProfile if automatically created
        userRepository.save(user1);

        user2 = new User("Jane Smith", "jane.smith@example.com", "hashedPassword2", userRole); // Pass single role
        // user2.setCreatedAt(LocalDateTime.now().minusDays(2)); // REMOVED: This method is likely gone
        user2.setUserProfile(new UserProfile(defaultAvatar)); // Set UserProfile if automatically created
        userRepository.save(user2);
        // --- End Fix ---
    }

    @Test
    @DisplayName("Should find user by email when email exists")
    void shouldFindUserByEmailWhenExists() {
        Optional<User> foundUser = userRepository.findByEmail("john.doe@example.com");
        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getEmail()).isEqualTo("john.doe@example.com");
        // --- FIX: getRoles() -> getRole() ---
        assertThat(foundUser.get().getRole()).isEqualTo(userRole); // Assert single role
        // --- End Fix ---
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
        // --- FIX: Pass single role to constructor ---
        User newUser = new User("New User", "new@example.com", "newHashedPass", userRole); // Pass single role
        newUser.setUserProfile(new UserProfile(defaultAvatar)); // Set UserProfile
        // --- End Fix ---

        User savedUser = userRepository.save(newUser);
        assertThat(savedUser.getId()).isNotNull();
        assertThat(savedUser.getName()).isEqualTo("New User");
        assertThat(userRepository.findByEmail("new@example.com")).isPresent();
        // --- FIX: getRoles() -> getRole() ---
        assertThat(savedUser.getRole()).isEqualTo(userRole); // Assert single role
        // --- End Fix ---
    }

    // --- NEW: Test for existsByName ---
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

    @Test
    @DisplayName("Should find users by role")
    void shouldFindUsersByRole() {
        // Assuming userRole is already set up in @BeforeEach
        User anotherUser = new User("Another User", "another@example.com", "pass", userRole);
        anotherUser.setUserProfile(new UserProfile(defaultAvatar));
        userRepository.save(anotherUser);

        // --- FIX THIS LINE ---
        // Call the corrected method on UserRepository
        List<User> usersWithRole = userRepository.findByRole_Name(ERole.ROLE_USER);
        // --- End Fix ---

        assertThat(usersWithRole).hasSize(3); // user1, user2, and anotherUser
        assertThat(usersWithRole).extracting(User::getEmail)
            .containsExactlyInAnyOrder("john.doe@example.com", "jane.smith@example.com", "another@example.com");
    }

}