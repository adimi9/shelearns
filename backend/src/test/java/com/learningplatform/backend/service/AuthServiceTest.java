// src/test/java/com/learningplatform/service/AuthServiceTest.java
package com.learningplatform.backend.service;

import com.learningplatform.backend.dto.request.LoginRequest; // NEW Import
import com.learningplatform.backend.dto.request.SignupRequest;
import com.learningplatform.backend.model.Role;
import com.learningplatform.backend.model.User;
import com.learningplatform.backend.model.enums.ERole;
import com.learningplatform.backend.repository.RoleRepository;
import com.learningplatform.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private RoleRepository roleRepository;

    @InjectMocks
    private AuthService authService;

    private SignupRequest signupRequest;
    private LoginRequest loginRequest; // NEW: For login tests
    private User testUser; // NEW: To represent a user existing in the DB
    private Role userRole;

    @BeforeEach
    void setUp() {
        signupRequest = new SignupRequest();
        signupRequest.setName("Test User");
        signupRequest.setEmail("test@example.com");
        signupRequest.setPassword("strongpassword123");

        loginRequest = new LoginRequest(); // Initialize for login tests
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("correctPassword");

        userRole = new Role(ERole.ROLE_USER);
        userRole.setId(1);

        Set<Role> roles = new HashSet<>();
        roles.add(userRole);
        testUser = new User("Test User", "test@example.com", "encodedPassword", roles); // User with encoded password
        testUser.setId(1L);
    }

    @Test
    @DisplayName("Should register a new user successfully")
    void shouldRegisterNewUserSuccessfully() {
        // Mock behavior:
        when(userRepository.existsByEmail(signupRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(signupRequest.getPassword())).thenReturn("hashed_strongpassword123");
        when(roleRepository.findByName(ERole.ROLE_USER)).thenReturn(Optional.of(userRole));

        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            if (user.getId() == null) {
                user.setId(1L);
            }
            assertThat(user.getRoles()).containsExactlyInAnyOrder(userRole);
            return user;
        });

        User registeredUser = authService.registerUser(signupRequest);

        // Assertions
        assertThat(registeredUser).isNotNull();
        assertThat(registeredUser.getId()).isNotNull();
        assertThat(registeredUser.getName()).isEqualTo("Test User");
        assertThat(registeredUser.getEmail()).isEqualTo("test@example.com");
        assertThat(registeredUser.getPasswordHash()).isEqualTo("hashed_strongpassword123");
        assertThat(registeredUser.getRoles()).containsExactlyInAnyOrder(userRole);

        // Verify interactions
        verify(userRepository, times(1)).existsByEmail(signupRequest.getEmail());
        verify(passwordEncoder, times(1)).encode(signupRequest.getPassword());
        verify(roleRepository, times(1)).findByName(ERole.ROLE_USER);
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when email already exists")
    void shouldThrowExceptionWhenEmailExists() {
        when(userRepository.existsByEmail(signupRequest.getEmail())).thenReturn(true);

        IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, () -> {
            authService.registerUser(signupRequest);
        });

        assertThat(thrown.getMessage()).isEqualTo("Email address already in use.");

        // Verify interactions
        verify(userRepository, times(1)).existsByEmail(signupRequest.getEmail());
        verify(passwordEncoder, never()).encode(anyString());
        verify(roleRepository, never()).findByName(any(ERole.class));
        verify(userRepository, never()).save(any(User.class));
    }

    // NEW TEST CASES FOR LOGIN

    @Test
    @DisplayName("Should login a user successfully with correct credentials")
    void shouldLoginUserSuccessfully() {
        // Mock behavior:
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(loginRequest.getPassword(), testUser.getPasswordHash())).thenReturn(true);

        User loggedInUser = authService.loginUser(loginRequest);

        // Assertions
        assertThat(loggedInUser).isNotNull();
        assertThat(loggedInUser.getEmail()).isEqualTo(loginRequest.getEmail());
        assertThat(loggedInUser.getPasswordHash()).isEqualTo(testUser.getPasswordHash());

        // Verify interactions
        verify(userRepository, times(1)).findByEmail(loginRequest.getEmail());
        verify(passwordEncoder, times(1)).matches(loginRequest.getPassword(), testUser.getPasswordHash());
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException for non-existent email during login")
    void shouldThrowExceptionForNonExistentEmailOnLogin() {
        // Mock behavior: email not found
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.empty());

        IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, () -> {
            authService.loginUser(loginRequest);
        });

        assertThat(thrown.getMessage()).isEqualTo("Invalid email or password.");

        // Verify interactions
        verify(userRepository, times(1)).findByEmail(loginRequest.getEmail());
        verify(passwordEncoder, never()).matches(anyString(), anyString()); // Password comparison should not happen
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException for incorrect password during login")
    void shouldThrowExceptionForIncorrectPasswordOnLogin() {
        // Mock behavior: email found, but password doesn't match
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(loginRequest.getPassword(), testUser.getPasswordHash())).thenReturn(false); // Password mismatch

        IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, () -> {
            authService.loginUser(loginRequest);
        });

        assertThat(thrown.getMessage()).isEqualTo("Invalid email or password.");

        // Verify interactions
        verify(userRepository, times(1)).findByEmail(loginRequest.getEmail());
        verify(passwordEncoder, times(1)).matches(loginRequest.getPassword(), testUser.getPasswordHash());
    }
}