// src/test/java/com/learningplatform/controller/AuthControllerTest.java
package com.learningplatform.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper; // Helps convert Java objects to JSON
import com.learningplatform.backend.dto.SignupRequest;
import com.learningplatform.backend.model.User;
import com.learningplatform.backend.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc; // Core class for testing MVC controllers

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*; // For status(), jsonPath() etc.

@WebMvcTest(AuthController.class) // Focuses test only on AuthController, mocks other beans
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc; // Injected to perform mock HTTP requests

    @Autowired
    private ObjectMapper objectMapper; // For converting DTOs to JSON strings

    @Autowired
    private AuthService authService;

    @Test
    @DisplayName("Should register user and return 200 OK")
    void shouldRegisterUserAndReturnOk() throws Exception {
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setName("Test User");
        signupRequest.setEmail("test@example.com");
        signupRequest.setPassword("strongpassword123");

        User registeredUser = new User("Test User", "test@example.com", "hashedPass");
        registeredUser.setId(1L);
        registeredUser.setCreatedAt(LocalDateTime.now());

        // Mock AuthService behavior: when registerUser is called, return our mock User
        when(authService.registerUser(any(SignupRequest.class))).thenReturn(registeredUser);

        mockMvc.perform(post("/api/auth/signup") // Perform a POST request
                        .contentType(MediaType.APPLICATION_JSON) // Set content type
                        .content(objectMapper.writeValueAsString(signupRequest))) // Set request body as JSON
                .andExpect(status().isOk()) // Expect HTTP 200 OK
                .andExpect(jsonPath("$.message").value("User registered successfully!")) // Check JSON response content
                .andExpect(jsonPath("$.userId").value(1L))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    @DisplayName("Should return 409 Conflict for existing email")
    void shouldReturnConflictForExistingEmail() throws Exception {
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setName("Existing User");
        signupRequest.setEmail("existing@example.com");
        signupRequest.setPassword("password123");

        // Mock AuthService to throw IllegalArgumentException for existing email
        when(authService.registerUser(any(SignupRequest.class)))
                .thenThrow(new IllegalArgumentException("Email address already in use."));

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isConflict()) // Expect HTTP 409 Conflict
                .andExpect(jsonPath("$.message").value("Email address already in use."));
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
                        .content(objectMapper.writeValueAsString(invalidSignupRequest)))
                .andExpect(status().isBadRequest()) // Expect HTTP 400 Bad Request due to @Valid
                .andExpect(jsonPath("$.email").value("Email must be valid")); // Check the specific error message
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
                        .content(objectMapper.writeValueAsString(invalidSignupRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.name").value("Name cannot be empty"));
    }

    // Add more tests for other validation scenarios (e.g., password too short)
}