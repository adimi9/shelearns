// File: src/test/java/com/learningplatform/backend/controller/AuthControllerTest.java

package com.learningplatform.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.learningplatform.backend.dto.request.LoginRequest;
import com.learningplatform.backend.dto.request.SignupRequest;
import com.learningplatform.backend.dto.response.LoginResponse; // Correctly imported
import com.learningplatform.backend.model.Role;
import com.learningplatform.backend.model.User;
import com.learningplatform.backend.model.UserProfile; // Needed for User mocking if constructor/setter requires it
import com.learningplatform.backend.model.Avatar;     // Needed for User mocking if UserProfile/Avatar constructor requires it
import com.learningplatform.backend.model.enums.EAvatar; // Needed for User mocking
import com.learningplatform.backend.model.enums.ERole;
import com.learningplatform.backend.security.jwt.AuthEntryPointJwt;
import com.learningplatform.backend.security.jwt.AuthTokenFilter;
import com.learningplatform.backend.security.jwt.JwtUtils;
import com.learningplatform.backend.security.services.UserDetailsServiceImpl;
import com.learningplatform.backend.service.AuthService;
import com.learningplatform.backend.config.DataInitializer; // Needed for exclusion
import com.learningplatform.backend.config.SecurityConfig;
import com.learningplatform.backend.exception.GlobalExceptionHandler;

import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.security.authentication.AuthenticationManager; // Although mocked, Spring context might still need it
import org.springframework.security.authentication.BadCredentialsException; // Specific exception for login test
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
@ActiveProfiles("test") // <-- Add this line

class AuthControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UserDetailsServiceImpl userDetailsService;

    @MockitoBean // Mocks the AuthService bean
    private AuthService authService;

    // AuthenticationManager is typically part of SecurityConfig and not directly injected into AuthController,
    // but if your SecurityConfig sets it up in a way that WebMvcTest can't resolve it without mocking, keep this.
    // In many setups, if AuthService is mocked, this mock might not be strictly needed for @WebMvcTest
    // unless AuthController explicitly depends on it outside of AuthService.
    @MockitoBean
    private AuthenticationManager authenticationManager;

     @MockitoBean // <-- ADD THIS LINE
     private JwtUtils jwtUtils; // <-- ADD THIS LINE

     @MockitoBean
    private AuthEntryPointJwt unauthorizedHandler;

    @MockitoBean
    private AuthTokenFilter authTokenFilter;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @BeforeEach
    void setup() {
        this.mockMvc = webAppContextSetup(webApplicationContext)
                .apply(springSecurity()) // Apply Spring Security filters for testing secured endpoints
                .build();
    }

    @Test
    @DisplayName("Should register user and return 200 OK")
    void shouldRegisterUserAndReturnOk() throws Exception {
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setName("Test User");
        signupRequest.setEmail("test@example.com");
        signupRequest.setPassword("strongpassword123");
        // No confirmPassword now, based on your DTO

        // Mocking the User object returned by AuthService.registerUser
        Role userRole = new Role(ERole.ROLE_USER);
        userRole.setId(1L); // Assign an ID for consistency in mocks

        // Assuming User constructor takes name, email, hashedPassword, role
        User registeredUser = new User("Test User", "test@example.com", "hashedPass", userRole);
        registeredUser.setId(1L); // Assign an ID

        // If UserProfile/Avatar are created/set in AuthService.registerUser, mock them here for the returned user
        Avatar defaultAvatar = new Avatar(EAvatar.AVATAR_TECH_GIRL);
        defaultAvatar.setId(1L);
        registeredUser.setUserProfile(new UserProfile(defaultAvatar)); // Set a basic UserProfile to avoid NPEs if accessed

        when(authService.registerUser(any(SignupRequest.class))).thenReturn(registeredUser);

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest))
                        .with(csrf())) // Required for POST requests with Spring Security CSRF enabled
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User registered successfully!"))
                .andExpect(jsonPath("$.userId").value(registeredUser.getId())) // Assert userId from response
                .andExpect(jsonPath("$.email").value(registeredUser.getEmail())); // Assert email from response
    }

    @Test
    @DisplayName("Should return 409 Conflict for existing email")
    void shouldReturnConflictForExistingEmail() throws Exception {
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setName("Existing User");
        signupRequest.setEmail("existing@example.com");
        signupRequest.setPassword("password123");

        // Mock AuthService to throw IllegalArgumentException (as handled by AuthController)
        when(authService.registerUser(any(SignupRequest.class)))
                .thenThrow(new IllegalArgumentException("Email address already in use."));

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest))
                        .with(csrf()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value("Conflict")) // Assert ErrorResponse structure
                .andExpect(jsonPath("$.message").value("Email address already in use."))
                .andExpect(jsonPath("$.path").value("/api/auth/signup"))
                .andDo(print()); // Print request/response for debugging
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
                // For @Valid errors, Spring's default error structure might be slightly different.
                // It often puts messages in an "errors" array or a specific "message" field.
                // Assuming your GlobalExceptionHandler maps it to a single "message" field.
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

    // --- TEST CASES FOR LOGIN ---

    @Test
    @DisplayName("Should login user and return 200 OK with JWT")
    void shouldLoginUserAndReturnOkWithJwt() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("strongpassword123");

        // Create a mock LoginResponse as AuthService.loginUser now returns it
        LoginResponse mockLoginResponse = new LoginResponse(
            "mockJwtToken12345", // A fake JWT
            1L,                  // User ID
            "Test User",         // User Name
            "test@example.com",  // User Email
            "ROLE_USER"          // User Role
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

        // Mock AuthService to throw Spring Security's AuthenticationException (e.g., BadCredentialsException)
        when(authService.loginUser(any(LoginRequest.class)))
                .thenThrow(new BadCredentialsException("Invalid email or password."));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest))
                        .with(csrf()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value("Unauthorized"))
                .andExpect(jsonPath("$.message").value("Invalid email or password."))
                .andExpect(jsonPath("$.path").value("/api/auth/login")) // Assert path from ErrorResponse
                .andDo(print());
    }

    @Test
    @DisplayName("Should return 400 Bad Request for blank login email")
    void shouldReturnBadRequestForBlankLoginEmail() throws Exception {
        LoginRequest invalidLoginRequest = new LoginRequest();
        invalidLoginRequest.setEmail(""); // Blank email
        invalidLoginRequest.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidLoginRequest))
                        .with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists()) // Expecting validation error message
                .andDo(print());
    }

    @Test
    @DisplayName("Should return 400 Bad Request for short login password")
    void shouldReturnBadRequestForShortLoginPassword() throws Exception {
        LoginRequest invalidLoginRequest = new LoginRequest();
        invalidLoginRequest.setEmail("test@example.com");
        invalidLoginRequest.setPassword("short"); // Password less than 8 characters

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidLoginRequest)) // Fixed: removed duplicate .content()
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

        // Mock AuthService to throw a generic RuntimeException
        when(authService.loginUser(any(LoginRequest.class)))
                .thenThrow(new RuntimeException("Something went wrong during login."));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest))
                        .with(csrf()))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value("Internal Server Error"))
                .andExpect(jsonPath("$.message").value("An error occurred during login."))
                .andExpect(jsonPath("$.path").value("/api/auth/login")) // Assert path from ErrorResponse
                .andDo(print());
    }
}