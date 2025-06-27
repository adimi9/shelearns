// File: src/test/java/com/learningplatform/backend/controller/AuthControllerTest.java

package com.learningplatform.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.learningplatform.backend.dto.request.LoginRequest;
import com.learningplatform.backend.dto.request.SignupRequest;
import com.learningplatform.backend.dto.response.LoginResponse;
import com.learningplatform.backend.dto.response.ErrorResponse;
import com.learningplatform.backend.model.User;
import com.learningplatform.backend.model.UserProfile;
import com.learningplatform.backend.model.enums.EAvatar;

import com.learningplatform.backend.service.AuthService;
import com.learningplatform.backend.security.jwt.AuthEntryPointJwt;
import com.learningplatform.backend.security.jwt.AuthTokenFilter;
import com.learningplatform.backend.security.jwt.JwtUtils;
import com.learningplatform.backend.security.services.UserDetailsServiceImpl;
import com.learningplatform.backend.repository.UserRepository;

// REMOVED: import com.learningplatform.backend.config.DataInitializer; // NO LONGER EXISTS

import com.learningplatform.backend.config.SecurityConfig;
import com.learningplatform.backend.exception.GlobalExceptionHandler;

import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;

import org.springframework.beans.factory.annotation.Autowired;
// REMOVED: import org.springframework.boot.autoconfigure.EnableAutoConfiguration; // Will be removed below
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
// REMOVED: @EnableAutoConfiguration(exclude = DataInitializer.class) // DataInitializer is gone, no need to exclude
@ActiveProfiles("test")
class AuthControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private AuthenticationManager authenticationManager;

    @MockitoBean
    private JwtUtils jwtUtils;

    @MockitoBean
    private UserDetailsServiceImpl userDetailsService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private AuthEntryPointJwt authEntryPointJwt;

    @MockitoBean
    private AuthTokenFilter authTokenFilter;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @BeforeEach
    void setup() {
        this.mockMvc = webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
    }

    @Test
    @DisplayName("Should register user and return 200 OK")
    void shouldRegisterUserAndReturnOk() throws Exception {
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setName("Test User");
        signupRequest.setEmail("test@example.com");
        signupRequest.setPassword("strongpassword123");

        User registeredUser = new User("Test User", "test@example.com", "hashedPass");
        registeredUser.setId(1L);

        registeredUser.setUserProfile(new UserProfile(EAvatar.AVATAR_TECH_GIRL));

        when(authService.registerUser(any(SignupRequest.class))).thenReturn(registeredUser);

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User registered successfully!"))
                .andExpect(jsonPath("$.userId").value(registeredUser.getId()))
                .andExpect(jsonPath("$.email").value(registeredUser.getEmail()));
    }

    @Test
    @DisplayName("Should return 409 Conflict for existing email")
    void shouldReturnConflictForExistingEmail() throws Exception {
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setName("Existing User");
        signupRequest.setEmail("existing@example.com");
        signupRequest.setPassword("password123");

        when(authService.registerUser(any(SignupRequest.class)))
                .thenThrow(new IllegalArgumentException("Email address already in use."));

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest))
                        .with(csrf()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value("Conflict"))
                .andExpect(jsonPath("$.message").value("Email address already in use."))
                .andExpect(jsonPath("$.path").value("/api/auth/signup"))
                .andDo(print());
    }

    @Test
    @DisplayName("Should return 400 Bad Request for invalid email format")
    void shouldReturnBadRequestForInvalidEmail() throws Exception {
        SignupRequest invalidSignupRequest = new SignupRequest();
        invalidSignupRequest.setName("Invalid Email User");
        invalidSignupRequest.setEmail("invalid-email"); // Invalid email format
        invalidSignupRequest.setPassword("password123");

        mockMvc.perform(post("/api/auth/signup")
                                 .contentType(MediaType.APPLICATION_JSON)
                                 .content(objectMapper.writeValueAsString(invalidSignupRequest))
                                 .with(csrf()))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("Should return 400 Bad Request for blank name")
    void shouldReturnBadRequestForBlankName() throws Exception {
        SignupRequest invalidSignupRequest = new SignupRequest();
        invalidSignupRequest.setName(""); // Blank name
        invalidSignupRequest.setEmail("test@example.com");
        invalidSignupRequest.setPassword("password123");

        mockMvc.perform(post("/api/auth/signup")
                                 .contentType(MediaType.APPLICATION_JSON)
                                 .content(objectMapper.writeValueAsString(invalidSignupRequest))
                                 .with(csrf()))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("Should login user and return 200 OK with JWT")
    void shouldLoginUserAndReturnOkWithJwt() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("strongpassword123");

        LoginResponse mockLoginResponse = new LoginResponse(
            "mockJwtToken12345",
            1L,
            "Test User",
            "test@example.com",
            "NONE"
        );

        when(authService.loginUser(any(LoginRequest.class))).thenReturn(mockLoginResponse);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value(mockLoginResponse.getToken()))
                .andExpect(jsonPath("$.type").value(mockLoginResponse.getType()))
                .andExpect(jsonPath("$.id").value(mockLoginResponse.getId()))
                .andExpect(jsonPath("$.name").value(mockLoginResponse.getName()))
                .andExpect(jsonPath("$.email").value(mockLoginResponse.getEmail()))
                .andExpect(jsonPath("$.role").value(mockLoginResponse.getRole()))
                .andDo(print());
    }

    @Test
    @DisplayName("Should return 401 Unauthorized for invalid login credentials")
    void shouldReturnUnauthorizedForInvalidLoginCredentials() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("nonexistent@example.com");
        loginRequest.setPassword("wrongpassword");

        when(authService.loginUser(any(LoginRequest.class)))
                .thenThrow(new BadCredentialsException("Invalid email or password."));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest))
                        .with(csrf()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value("Unauthorized"))
                .andExpect(jsonPath("$.message").value("Invalid email or password."))
                .andExpect(jsonPath("$.path").value("/api/auth/login"))
                .andDo(print());
    }

    @Test
    @DisplayName("Should return 400 Bad Request for blank login email")
    void shouldReturnBadRequestForBlankLoginEmail() throws Exception {
        LoginRequest invalidLoginRequest = new LoginRequest();
        invalidLoginRequest.setEmail("");
        invalidLoginRequest.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidLoginRequest))
                        .with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists())
                .andDo(print());
    }

    @Test
    @DisplayName("Should return 400 Bad Request for short login password")
    void shouldReturnBadRequestForShortLoginPassword() throws Exception {
        LoginRequest invalidLoginRequest = new LoginRequest();
        invalidLoginRequest.setEmail("test@example.com");
        invalidLoginRequest.setPassword("short");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidLoginRequest))
                        .with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists())
                .andDo(print());
    }

    @Test
    @DisplayName("Should return 500 Internal Server Error for unexpected login exception")
    void shouldReturnInternalServerErrorForLoginUnexpectedException() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");

        when(authService.loginUser(any(LoginRequest.class)))
                .thenThrow(new RuntimeException("Something went wrong during login."));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest))
                        .with(csrf()))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value("Internal Server Error"))
                .andExpect(jsonPath("$.message").value("An error occurred during login."))
                .andExpect(jsonPath("$.path").value("/api/auth/login"))
                .andDo(print());
    }
}