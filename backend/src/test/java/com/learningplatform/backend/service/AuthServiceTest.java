// src/test/java/com/learningplatform/backend/service/AuthServiceTest.java
package com.learningplatform.backend.service;

import com.learningplatform.backend.dto.request.LoginRequest;
import com.learningplatform.backend.dto.request.SignupRequest;
import com.learningplatform.backend.dto.response.LoginResponse;
import com.learningplatform.backend.model.User;
import com.learningplatform.backend.model.UserProfile;
// REMOVED: import com.learningplatform.backend.model.Role;
// REMOVED: import com.learningplatform.backend.model.Avatar;
import com.learningplatform.backend.model.enums.EAvatar;
// REMOVED: import com.learningplatform.backend.model.enums.ERole; // No longer needed for User/Role setup

// REMOVED: import com.learningplatform.backend.repository.AvatarRepository;
// REMOVED: import com.learningplatform.backend.repository.RoleRepository;
import com.learningplatform.backend.repository.UserRepository;

// Spring Security related mocks
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import com.learningplatform.backend.security.jwt.JwtUtils;
import com.learningplatform.backend.security.services.UserDetailsImpl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

// REMOVED: import java.util.HashSet;
import java.util.Optional;
// REMOVED: import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
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

    // REMOVED: @Mock private RoleRepository roleRepository; // Role entity is gone
    // REMOVED: @Mock private AvatarRepository avatarRepository; // Avatar entity is not used by UserProfile

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtils jwtUtils;

    @InjectMocks
    private AuthService authService;

    private SignupRequest signupRequest;
    private LoginRequest loginRequest;
    private User testUser;
    // REMOVED: private Role userRole; // Role entity is gone
    // REMOVED: private Avatar defaultAvatar; // Avatar entity is not used by UserProfile

    @BeforeEach
    void setUp() {
        signupRequest = new SignupRequest();
        signupRequest.setName("Test User");
        signupRequest.setEmail("test@example.com");
        signupRequest.setPassword("strongpassword123");
        // Ensure this DTO still matches your frontend and backend expectations.
        // If confirmPassword is truly gone from SignupRequest DTO, remove this line.

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("correctPassword");

        // REMOVED: userRole = new Role(ERole.ROLE_USER);
        // REMOVED: userRole.setId(1L);

        // REMOVED: defaultAvatar = new Avatar(EAvatar.AVATAR_TECH_GIRL);
        // REMOVED: defaultAvatar.setId(1L);

        // --- FIX: User constructor now takes (name, email, passwordHash) ---
        testUser = new User("Test User", "test@example.com", "encodedPassword"); // No role parameter
        testUser.setId(1L);
        // --- FIX: UserProfile constructor now takes EAvatar directly ---
        testUser.setUserProfile(new UserProfile(EAvatar.AVATAR_TECH_GIRL)); // Set UserProfile with EAvatar
        // --- End Fix ---
    }

    @Test
    @DisplayName("Should register a new user successfully")
    void shouldRegisterNewUserSuccessfully() {
        when(userRepository.existsByEmail(signupRequest.getEmail())).thenReturn(false);
        when(userRepository.existsByName(signupRequest.getName())).thenReturn(false);
        when(passwordEncoder.encode(signupRequest.getPassword())).thenReturn("hashed_strongpassword123");
        // REMOVED: when(roleRepository.findByName(ERole.ROLE_USER)).thenReturn(Optional.of(userRole));
        // REMOVED: when(avatarRepository.findByName(EAvatar.AVATAR_TECH_GIRL)).thenReturn(Optional.of(defaultAvatar));
        // Note: If AuthService itself performs an EAvatar lookup without AvatarRepository,
        // you'd mock that *internal* behavior within AuthService.

        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            if (user.getId() == null) {
                user.setId(1L);
            }
            // REMOVED: assertThat(user.getRole().getName()).isEqualTo(userRole.getName());
            return user;
        });

        User registeredUser = authService.registerUser(signupRequest);

        assertThat(registeredUser).isNotNull();
        assertThat(registeredUser.getId()).isNotNull();
        assertThat(registeredUser.getName()).isEqualTo("Test User");
        assertThat(registeredUser.getEmail()).isEqualTo("test@example.com");
        assertThat(registeredUser.getPasswordHash()).isEqualTo("hashed_strongpassword123");
        // REMOVED: assertThat(registeredUser.getRole()).isEqualTo(userRole);
        assertThat(registeredUser.getUserProfile()).isNotNull();
        // --- FIX: Check EAvatar enum directly ---
        assertThat(registeredUser.getUserProfile().getAvatar()).isEqualTo(EAvatar.AVATAR_TECH_GIRL);
        // --- End Fix ---

        verify(userRepository, times(1)).existsByEmail(signupRequest.getEmail());
        verify(userRepository, times(1)).existsByName(signupRequest.getName());
        verify(passwordEncoder, times(1)).encode(signupRequest.getPassword());
        // REMOVED: verify(roleRepository, times(1)).findByName(ERole.ROLE_USER);
        // REMOVED: verify(avatarRepository, times(1)).findByName(EAvatar.AVATAR_TECH_GIRL);
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

        verify(userRepository, times(1)).existsByEmail(signupRequest.getEmail());
        verify(userRepository, never()).existsByName(anyString());
        verify(passwordEncoder, never()).encode(anyString());
        // REMOVED: verify(roleRepository, never()).findByName(any(ERole.class));
        // REMOVED: verify(avatarRepository, never()).findByName(any(EAvatar.class));
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
        // REMOVED: verify(roleRepository, never()).findByName(any(ERole.class));
        // REMOVED: verify(avatarRepository, never()).findByName(any(EAvatar.class));
        verify(userRepository, never()).save(any(User.class));
    }

    // NEW TEST CASES FOR LOGIN - UPDATED TO REFLECT JWT AUTH LOGIC

    @Test
    @DisplayName("Should login a user successfully and return LoginResponse")
    void shouldLoginUserSuccessfullyAndReturnLoginResponse() {
        Authentication authentication = mock(Authentication.class);
        UserDetailsImpl userDetails = UserDetailsImpl.build(testUser);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(authentication);

        String expectedJwt = "mock_jwt_token";
        when(jwtUtils.generateJwtToken(userDetails)).thenReturn(expectedJwt);

        LoginResponse loggedInResponse = authService.loginUser(loginRequest);

        assertThat(loggedInResponse).isNotNull();
        assertThat(loggedInResponse.getToken()).isEqualTo(expectedJwt);
        assertThat(loggedInResponse.getType()).isEqualTo("Bearer");
        assertThat(loggedInResponse.getId()).isEqualTo(testUser.getId());
        assertThat(loggedInResponse.getName()).isEqualTo(testUser.getName());
        assertThat(loggedInResponse.getEmail()).isEqualTo(testUser.getEmail());
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtUtils, times(1)).generateJwtToken(userDetails);
        verify(userRepository, never()).findByEmail(anyString());
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }


    @Test
    @DisplayName("Should throw BadCredentialsException for invalid login credentials")
    void shouldThrowBadCredentialsExceptionForInvalidLogin() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenThrow(new BadCredentialsException("Invalid email or password."));

        assertThatThrownBy(() -> authService.loginUser(loginRequest))
            .isInstanceOf(BadCredentialsException.class)
            .hasMessageContaining("Invalid email or password.");

        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtUtils, never()).generateJwtToken(any(UserDetailsImpl.class));
        verify(userRepository, never()).findByEmail(anyString());
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

}