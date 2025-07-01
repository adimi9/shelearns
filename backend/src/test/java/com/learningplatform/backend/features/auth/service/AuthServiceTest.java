package com.learningplatform.backend.features.auth.service;

import com.learningplatform.backend.features.auth.dto.request.*;
import com.learningplatform.backend.features.auth.util.JwtUtil;
import com.learningplatform.backend.model.user.User;
import com.learningplatform.backend.repository.user.UserRepository;
import com.learningplatform.backend.repository.user.profile.UserProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    @Mock
    UserRepository userRepository;

    @Mock
    UserProfileRepository userProfileRepository;

    @Mock
    PasswordEncoder passwordEncoder;

    @Mock
    JwtUtil jwtUtil;

    @InjectMocks
    AuthService authService;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void signup_shouldThrowIfEmailExists() {
        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(new User()));

        SignupRequestDto dto = new SignupRequestDto("user", "test@example.com", "pass");

        Exception ex = assertThrows(RuntimeException.class, () -> authService.signup(dto));
        assertEquals("Email already registered", ex.getMessage());
    }

    @Test
    void login_shouldReturnTokenIfValid() {
        User user = User.builder()
                .id(1L)
                .email("test@example.com")
                .passwordHash("hashed")
                .build();

        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password", "hashed")).thenReturn(true);
        when(jwtUtil.generateToken(1L)).thenReturn("token");

        LoginRequestDto dto = new LoginRequestDto("test@example.com", "password");
        var response = authService.login(dto);

        assertEquals("token", response.getToken());
    }
}
