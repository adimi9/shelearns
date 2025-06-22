// src/test/java/com/learningplatform/service/AuthServiceTest.java
package com.learningplatform.backend.service;

import com.learningplatform.backend.dto.SignupRequest;
import com.learningplatform.backend.model.User;
import com.learningplatform.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class) // Enables Mockito annotations for JUnit 5
class AuthServiceTest {

    @Mock // Creates a mock instance of UserRepository
    private UserRepository userRepository;

    @Mock // Creates a mock instance of PasswordEncoder
    private PasswordEncoder passwordEncoder;

    @InjectMocks // Injects the mocks into AuthService
    private AuthService authService;

    private SignupRequest signupRequest;

    @BeforeEach
    void setUp() {
        signupRequest = new SignupRequest();
        signupRequest.setName("Test User");
        signupRequest.setEmail("test@example.com");
        signupRequest.setPassword("strongpassword123");
    }

    @Test
    @DisplayName("Should register a new user successfully")
    void shouldRegisterNewUserSuccessfully() {
        // Mock behavior:
        // 1. When existsByEmail is called with test@example.com, return false (email not in use)
        when(userRepository.existsByEmail(signupRequest.getEmail())).thenReturn(false);
        // 2. When passwordEncoder.encode is called with any string, return a hashed version
        when(passwordEncoder.encode(signupRequest.getPassword())).thenReturn("hashed_strongpassword123");
        // 3. When userRepository.save is called with any User object, return the same User object (simulating save)
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            // Simulate ID generation by JPA
            if (user.getId() == null) {
                user.setId(1L);
            }
            return user;
        });

        // Call the method under test
        User registeredUser = authService.registerUser(signupRequest);

        // Assertions
        assertThat(registeredUser).isNotNull();
        assertThat(registeredUser.getId()).isNotNull();
        assertThat(registeredUser.getName()).isEqualTo("Test User");
        assertThat(registeredUser.getEmail()).isEqualTo("test@example.com");
        assertThat(registeredUser.getPasswordHash()).isEqualTo("hashed_strongpassword123");

        // Verify interactions: Ensure the mocked methods were called as expected
        verify(userRepository, times(1)).existsByEmail(signupRequest.getEmail());
        verify(passwordEncoder, times(1)).encode(signupRequest.getPassword());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when email already exists")
    void shouldThrowExceptionWhenEmailExists() {
        // Mock behavior: When existsByEmail is called, return true (email already in use)
        when(userRepository.existsByEmail(signupRequest.getEmail())).thenReturn(true);

        // Assert that calling registerUser throws an IllegalArgumentException
        IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, () -> {
            authService.registerUser(signupRequest);
        });

        // Assert the error message
        assertThat(thrown.getMessage()).isEqualTo("Email address already in use.");

        // Verify interactions: Ensure only existsByEmail was called, others shouldn't be
        verify(userRepository, times(1)).existsByEmail(signupRequest.getEmail());
        verify(passwordEncoder, never()).encode(anyString()); // Password encoder should not be called
        verify(userRepository, never()).save(any(User.class)); // Save should not be called
    }
}