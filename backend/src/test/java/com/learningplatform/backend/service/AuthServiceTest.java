// src/test/java/com/learningplatform/backend/service/AuthServiceTest.java
package com.learningplatform.backend.service;

import com.learningplatform.backend.dto.request.LoginRequest;
import com.learningplatform.backend.dto.request.SignupRequest;
import com.learningplatform.backend.dto.response.LoginResponse; // NEW: Import LoginResponse
import com.learningplatform.backend.model.Role;
import com.learningplatform.backend.model.User;
import com.learningplatform.backend.model.UserProfile; // Needed for user creation
import com.learningplatform.backend.model.Avatar;     // Needed for user creation
import com.learningplatform.backend.model.enums.EAvatar; // Needed for user creation
import com.learningplatform.backend.model.enums.ERole;
import com.learningplatform.backend.repository.AvatarRepository; // NEW: Mock this
import com.learningplatform.backend.repository.RoleRepository;
import com.learningplatform.backend.repository.UserRepository;

// Spring Security related mocks
import org.springframework.security.authentication.AuthenticationManager; // NEW: Mock this
import org.springframework.security.authentication.BadCredentialsException; // For login failure tests
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken; // For AuthenticationManager.authenticate()
import org.springframework.security.core.Authentication; // For AuthenticationManager.authenticate()
import com.learningplatform.backend.security.jwt.JwtUtils; // NEW: Mock this
import com.learningplatform.backend.security.services.UserDetailsImpl; // NEW: Needed for mocking UserDetails

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet; // Still needed for mocking old user, but user model now uses single Role
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy; // For more fluent exception testing
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

    @Mock // NEW: Mock AvatarRepository
    private AvatarRepository avatarRepository;

    @Mock // NEW: Mock AuthenticationManager
    private AuthenticationManager authenticationManager;

    @Mock // NEW: Mock JwtUtils
    private JwtUtils jwtUtils;

    // Correctly injects mocks into AuthService's constructor
    @InjectMocks
    private AuthService authService;

    private SignupRequest signupRequest;
    private LoginRequest loginRequest;
    private User testUser;
    private Role userRole;
    private Avatar defaultAvatar; // NEW: For mocking Avatar

    @BeforeEach
    void setUp() {
        signupRequest = new SignupRequest();
        signupRequest.setName("Test User");
        signupRequest.setEmail("test@example.com");
        signupRequest.setPassword("strongpassword123");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("correctPassword");

        userRole = new Role(ERole.ROLE_USER);
        userRole.setId(1L); // Ensure ID is Long

        defaultAvatar = new Avatar(EAvatar.AVATAR_TECH_GIRL); // Initialize default avatar
        defaultAvatar.setId(1L);

        // --- FIX: User constructor now takes a single Role, and no setCreatedAt ---
        testUser = new User("Test User", "test@example.com", "encodedPassword", userRole);
        testUser.setId(1L);
        testUser.setUserProfile(new UserProfile(defaultAvatar)); // Set a basic UserProfile with default Avatar
        // --- End Fix ---
    }

    @Test
    @DisplayName("Should register a new user successfully")
    void shouldRegisterNewUserSuccessfully() {
        // Mock behavior:
        when(userRepository.existsByEmail(signupRequest.getEmail())).thenReturn(false);
        when(userRepository.existsByName(signupRequest.getName())).thenReturn(false); // Add mock for existsByName
        when(passwordEncoder.encode(signupRequest.getPassword())).thenReturn("hashed_strongpassword123");
        when(roleRepository.findByName(ERole.ROLE_USER)).thenReturn(Optional.of(userRole));
        when(avatarRepository.findByName(EAvatar.AVATAR_TECH_GIRL)).thenReturn(Optional.of(defaultAvatar)); // Mock avatar lookup

        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            if (user.getId() == null) {
                user.setId(1L);
            }
            // --- FIX: getRoles() -> getRole() ---
            assertThat(user.getRole().getName()).isEqualTo(userRole.getName()); // Check the single role's name
            // --- End Fix ---
            return user;
        });

        User registeredUser = authService.registerUser(signupRequest);

        // Assertions
        assertThat(registeredUser).isNotNull();
        assertThat(registeredUser.getId()).isNotNull();
        assertThat(registeredUser.getName()).isEqualTo("Test User");
        assertThat(registeredUser.getEmail()).isEqualTo("test@example.com");
        assertThat(registeredUser.getPasswordHash()).isEqualTo("hashed_strongpassword123");
        // --- FIX: getRoles() -> getRole() ---
        assertThat(registeredUser.getRole()).isEqualTo(userRole);
        // --- End Fix ---
        assertThat(registeredUser.getUserProfile()).isNotNull();
        assertThat(registeredUser.getUserProfile().getAvatar()).isEqualTo(defaultAvatar);

        // Verify interactions
        verify(userRepository, times(1)).existsByEmail(signupRequest.getEmail());
        verify(userRepository, times(1)).existsByName(signupRequest.getName()); // Verify existsByName
        verify(passwordEncoder, times(1)).encode(signupRequest.getPassword());
        verify(roleRepository, times(1)).findByName(ERole.ROLE_USER);
        verify(avatarRepository, times(1)).findByName(EAvatar.AVATAR_TECH_GIRL); // Verify avatar lookup
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
        verify(userRepository, never()).existsByName(anyString()); // Verify existsByName not called
        verify(passwordEncoder, never()).encode(anyString());
        verify(roleRepository, never()).findByName(any(ERole.class));
        verify(avatarRepository, never()).findByName(any(EAvatar.class)); // Verify avatar lookup not called
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when name already exists")
    void shouldThrowExceptionWhenNameExists() {
        when(userRepository.existsByEmail(signupRequest.getEmail())).thenReturn(false);
        when(userRepository.existsByName(signupRequest.getName())).thenReturn(true);

        IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, () -> {
            authService.registerUser(signupRequest);
        });

        assertThat(thrown.getMessage()).isEqualTo("Name already in use.");

        verify(userRepository, times(1)).existsByEmail(signupRequest.getEmail());
        verify(userRepository, times(1)).existsByName(signupRequest.getName());
        verify(passwordEncoder, never()).encode(anyString());
        verify(roleRepository, never()).findByName(any(ERole.class));
        verify(avatarRepository, never()).findByName(any(EAvatar.class));
        verify(userRepository, never()).save(any(User.class));
    }


    // NEW TEST CASES FOR LOGIN - UPDATED TO REFLECT JWT AUTH LOGIC

    @Test
    @DisplayName("Should login a user successfully and return LoginResponse")
    void shouldLoginUserSuccessfullyAndReturnLoginResponse() {
        // Mock Spring Security Authentication flow
        Authentication authentication = mock(Authentication.class);
        UserDetailsImpl userDetails = UserDetailsImpl.build(testUser); // Use UserDetailsImpl.build
        when(authentication.getPrincipal()).thenReturn(userDetails); // Return our mocked UserDetails
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(authentication);

        String expectedJwt = "mock_jwt_token";
        when(jwtUtils.generateJwtToken(userDetails)).thenReturn(expectedJwt);

        // --- FIX: authService.loginUser now returns LoginResponse ---
        LoginResponse loggedInResponse = authService.loginUser(loginRequest);

        // Assertions for LoginResponse
        assertThat(loggedInResponse).isNotNull();
        assertThat(loggedInResponse.getToken()).isEqualTo(expectedJwt);
        assertThat(loggedInResponse.getType()).isEqualTo("Bearer");
        assertThat(loggedInResponse.getId()).isEqualTo(testUser.getId());
        assertThat(loggedInResponse.getName()).isEqualTo(testUser.getName());
        assertThat(loggedInResponse.getEmail()).isEqualTo(testUser.getEmail());
        assertThat(loggedInResponse.getRole()).isEqualTo(testUser.getRole().getName().name()); // Get role name as String

        // Verify interactions
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtUtils, times(1)).generateJwtToken(userDetails);
        verify(userRepository, never()).findByEmail(anyString()); // This is handled by UserDetailsService
        verify(passwordEncoder, never()).matches(anyString(), anyString()); // This is handled by DaoAuthenticationProvider
    }


    @Test
    @DisplayName("Should throw BadCredentialsException for invalid login credentials")
    void shouldThrowBadCredentialsExceptionForInvalidLogin() {
        // Mock AuthenticationManager to throw an exception for invalid credentials
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenThrow(new BadCredentialsException("Invalid email or password."));

        // Assert that calling loginUser throws the expected exception
        assertThatThrownBy(() -> authService.loginUser(loginRequest))
            .isInstanceOf(BadCredentialsException.class)
            .hasMessageContaining("Invalid email or password.");

        // Verify interactions
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtUtils, never()).generateJwtToken(any(UserDetailsImpl.class)); // JWT should not be generated
        verify(userRepository, never()).findByEmail(anyString());
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    // Removed the separate "non-existent email" and "incorrect password" tests for login.
    // In a real Spring Security setup, these are typically consolidated into a single
    // BadCredentialsException by the AuthenticationManager.authenticate() method.
    // If you have a custom UserDetailsService throwing different exceptions,
    // you might re-introduce more specific tests.
}