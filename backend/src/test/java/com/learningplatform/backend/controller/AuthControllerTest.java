package com.learningplatform.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper; // convert Java objects to JSON
// defined in src/main, programs to test the AuthController
import com.learningplatform.backend.dto.request.LoginRequest; // NEW Import
import com.learningplatform.backend.dto.request.SignupRequest;
import com.learningplatform.backend.model.Role;
import com.learningplatform.backend.model.User;
import com.learningplatform.backend.model.enums.ERole;
import com.learningplatform.backend.service.AuthService;
import com.learningplatform.backend.config.SecurityConfig;
import com.learningplatform.backend.exception.GlobalExceptionHandler; // global exception handler to handle exceptions thrown by AuthController

// testing framework tools from JUNit
import org.junit.jupiter.api.Test; // define what a test is
import org.junit.jupiter.api.BeforeEach; // define what to do before each test
import org.junit.jupiter.api.DisplayName; // give each test a readable name

// Spring Framework testing tools
import org.springframework.beans.factory.annotation.Autowired; // dependency injection
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest; // only test web layer (spring MVC controllers)
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean; // mock dependencies
import org.springframework.http.MediaType; // define media type of requests
import org.springframework.test.web.servlet.MockMvc; // simulate HTTP requests and responses
import org.springframework.security.authentication.AuthenticationManager; // mock authentication
import org.springframework.web.context.WebApplicationContext; // web application context
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

// Spring Security
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class) // only test AuthController, not the entire web application context
@Import({SecurityConfig.class, GlobalExceptionHandler.class}) // import the security configuration to apply security filters
class AuthControllerTest {

    private MockMvc mockMvc; // simulate HTTP requests and responses

    @Autowired
    private ObjectMapper objectMapper; // convert Java objects to JSON

    @MockitoBean
    private AuthService authService; // mock AuthService

    @MockitoBean
    private AuthenticationManager authenticationManager; // mock AuthenticationManager

    @Autowired
    private WebApplicationContext webApplicationContext; // properly configure MockMvc with Spring Security

    @BeforeEach // run before each test
    void setup() {
        this.mockMvc = webAppContextSetup(webApplicationContext) // use the web application context as foundation
                .apply(springSecurity()) // apply Spring Security filters
                .build(); // finalise construction of MockMvc object
    }

    @Test
    @DisplayName("Should register user and return 200 OK")
    void shouldRegisterUserAndReturnOk() throws Exception {
        // create SignupRequest object with valid data
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setName("Test User");
        signupRequest.setEmail("test@example.com");
        signupRequest.setPassword("strongpassword123");

        // create User object that AuthService is expected to return after successful registration
        Set<Role> roles = new HashSet<>(Collections.singletonList(new Role(ERole.ROLE_USER)));
        User registeredUser = new User("Test User", "test@example.com", "hashedPass", roles);
        registeredUser.setId(1L);
        registeredUser.setCreatedAt(LocalDateTime.now());

        // instruct fake AuthService to return the User object when registerUser is called
        when(authService.registerUser(any(SignupRequest.class))).thenReturn(registeredUser);

        // simulate web browser actions
        mockMvc.perform(post("/api/auth/signup") // simulate HTTP POST request to /api/auth/signup endpoint
                        .contentType(MediaType.APPLICATION_JSON) // set Content-Type header to application/json
                        .content(objectMapper.writeValueAsString(signupRequest)) // convert SignupRequest Java object to JSON string
                        .with(csrf())) // add a valid CSRF token to simulated request
                .andExpect(status().isOk()) // check if HTTP status code is 200 OK
                .andExpect(jsonPath("$.message").value("User registered successfully!")); // check if value of message field in JSON response is exactly "User registered successfully!"
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
                        .with(csrf())) // Add CSRF token for POST requests
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Email address already in use."))
                .andDo(result -> System.out.println("Response: " + result.getResponse().getContentAsString())); // For debugging
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
                .andDo(print()) // <--- ADDED HERE! This will print the request/response details
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
                .andDo(print()) // <--- ADDED HERE!
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
    }

    // NEW TEST CASES FOR LOGIN

    @Test
    @DisplayName("Should login user and return 200 OK")
    void shouldLoginUserAndReturnOk() throws Exception {
        // Create LoginRequest object with valid credentials
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("strongpassword123");

        // Create User object that AuthService is expected to return after successful login
        Set<Role> roles = new HashSet<>(Collections.singletonList(new Role(ERole.ROLE_USER)));
        User authenticatedUser = new User("Test User", "test@example.com", "hashedPass", roles);
        authenticatedUser.setId(1L);
        authenticatedUser.setCreatedAt(LocalDateTime.now());

        // Instruct fake AuthService to return the User object when loginUser is called
        when(authService.loginUser(any(LoginRequest.class))).thenReturn(authenticatedUser);

        // Simulate HTTP POST request to /api/auth/login endpoint
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User logged in successfully!"))
                .andExpect(jsonPath("$.userId").value(authenticatedUser.getId()))
                .andExpect(jsonPath("$.email").value(authenticatedUser.getEmail()))
                .andDo(print()); // Print request/response for debugging
    }

    @Test
    @DisplayName("Should return 401 Unauthorized for invalid login credentials")
    void shouldReturnUnauthorizedForInvalidLoginCredentials() throws Exception {
        // Create LoginRequest object with invalid credentials
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("nonexistent@example.com");
        loginRequest.setPassword("wrongpassword");

        // Instruct fake AuthService to throw IllegalArgumentException for invalid credentials
        when(authService.loginUser(any(LoginRequest.class)))
                .thenThrow(new IllegalArgumentException("Invalid email or password."));

        // Simulate HTTP POST request to /api/auth/login endpoint
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest))
                        .with(csrf()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password."))
                .andDo(print()); // Print request/response for debugging
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
                .andExpect(jsonPath("$.message").exists())
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
                .andExpect(jsonPath("$.message").value("An error occurred during login."))
                .andDo(print());
    }
}