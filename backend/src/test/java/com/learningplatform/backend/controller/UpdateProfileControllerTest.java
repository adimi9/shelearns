package com.learningplatform.backend.controller;
import com.learningplatform.backend.model.User; // Make sure this path is correct for your User entity

import com.fasterxml.jackson.databind.ObjectMapper;
import com.learningplatform.backend.dto.request.UpdateProfileRequest;
import com.learningplatform.backend.dto.response.UpdateProfileResponse;
import com.learningplatform.backend.security.services.UserDetailsImpl; // Make sure this import is correct
import com.learningplatform.backend.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UpdateProfileController.class) // Focuses on testing the web layer for UpdateProfileController
public class UpdateProfileControllerTest {

    @Autowired
    private MockMvc mockMvc; // Used to perform HTTP requests

    @Autowired
    private ObjectMapper objectMapper; // Used to convert objects to JSON strings

    @MockitoBean
    private UserService userService; // Mock the UserService dependency

    private UserDetailsImpl mockUserDetails;
    private Long authenticatedUserId = 1L; // Example user ID for tests

    @BeforeEach
    void setUp() {
        // Create a mock User object that matches the structure UserDetailsImpl.build(User user) expects
        User mockUser = new User();
        mockUser.setId(authenticatedUserId);
        mockUser.setName("testuser"); // Or any name you like
        mockUser.setEmail("test@example.com");

        // Now, pass the mock User object to the build method
        mockUserDetails = UserDetailsImpl.build(mockUser);
    }

    @Test
    void testUpdateProfile_Success() throws Exception {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setName("Updated Name");
        request.setEmail("updated.email@example.com");

        UpdateProfileResponse expectedResponse = new UpdateProfileResponse(
                authenticatedUserId,
                request.getName(),
                request.getEmail()
        );

        // Mock the UserService to return the expected response when called
        when(userService.updateUserProfile(eq(authenticatedUserId), any(UpdateProfileRequest.class)))
                .thenReturn(expectedResponse);

        mockMvc.perform(patch("/api/profile")
                .with(user(mockUserDetails)) // Authenticate the request with our mock user
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))) // Convert request DTO to JSON
                .andExpect(status().isOk()) // Expect HTTP 200 OK
                .andExpect(jsonPath("$.id").value(authenticatedUserId))
                .andExpect(jsonPath("$.name").value("Updated Name"))
                .andExpect(jsonPath("$.email").value("updated.email@example.com"));
    }

    @Test
    void testUpdateProfile_EmailAlreadyTaken() throws Exception {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setName("Some Name");
        request.setEmail("taken@example.com"); // Email that is supposedly already taken

        // Mock the UserService to throw IllegalArgumentException for a taken email
        when(userService.updateUserProfile(eq(authenticatedUserId), any(UpdateProfileRequest.class)))
                .thenThrow(new IllegalArgumentException("Email 'taken@example.com' is already in use."));

        mockMvc.perform(patch("/api/profile")
                .with(user(mockUserDetails))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest()) // Expect HTTP 400 Bad Request
                .andExpect(jsonPath("$.status").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Email 'taken@example.com' is already in use."))
                .andExpect(jsonPath("$.path").value("/api/profile"));
    }

    @Test
    void testUpdateProfile_BlankNameValidation() throws Exception {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setName(""); // Blank name
        request.setEmail("valid@example.com");

        mockMvc.perform(patch("/api/profile")
                .with(user(mockUserDetails))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest()) // Expect HTTP 400 Bad Request due to @NotBlank
                .andExpect(jsonPath("$.status").value("Bad Request"))
                .andExpect(jsonPath("$.message").exists()) // Message will contain validation error details
                .andExpect(jsonPath("$.message").value("Name cannot be empty")); // Specific message from @NotBlank
    }

    @Test
    void testUpdateProfile_Unauthorized() throws Exception {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setName("Unauthorized User");
        request.setEmail("unauth@example.com");

        // No .with(user()) is used here, so the request is not authenticated
        mockMvc.perform(patch("/api/profile")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized()); // Expect HTTP 401 Unauthorized
    }

    // You might also want to add tests for:
    // - Invalid email format (e.g., "invalid-email")
    // - User not found (though for authenticated users, this is less likely)
    // - Internal server error handling (mock service to throw a generic Exception)
}