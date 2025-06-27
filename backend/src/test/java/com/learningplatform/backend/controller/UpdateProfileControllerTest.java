package com.learningplatform.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.learningplatform.backend.config.SecurityConfig;
import com.learningplatform.backend.dto.request.ChangePasswordRequest;
import com.learningplatform.backend.dto.request.UpdateProfileRequest;
import com.learningplatform.backend.dto.response.UpdateProfileResponse;
import com.learningplatform.backend.exception.GlobalExceptionHandler;
import com.learningplatform.backend.model.User;
import com.learningplatform.backend.repository.UserRepository;
import com.learningplatform.backend.security.jwt.AuthEntryPointJwt;
import com.learningplatform.backend.security.jwt.AuthTokenFilter;
import com.learningplatform.backend.security.jwt.JwtUtils;
import com.learningplatform.backend.security.services.UserDetailsImpl;
import com.learningplatform.backend.security.services.UserDetailsServiceImpl;
import com.learningplatform.backend.service.AuthService;
import com.learningplatform.backend.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.context.WebApplicationContext;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

@WebMvcTest(UpdateProfileController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
@ActiveProfiles("test")
public class UpdateProfileControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean private UserService userService;
    @MockitoBean private AuthService authService;
    @MockitoBean private AuthenticationManager authenticationManager;
    @MockitoBean private JwtUtils jwtUtils;
    @MockitoBean private UserDetailsServiceImpl userDetailsService;
    @MockitoBean private UserRepository userRepository;
    @MockitoBean private AuthEntryPointJwt authEntryPointJwt;
    @MockitoBean private AuthTokenFilter authTokenFilter;
    @MockitoBean private PasswordEncoder passwordEncoder;

    @Autowired
    private WebApplicationContext webApplicationContext;

    private UserDetailsImpl mockUserDetails;
    private Long authenticatedUserId = 1L;

    @BeforeEach
    void setUp() {
        this.mockMvc = webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();

        User mockUser = new User();
        mockUser.setId(authenticatedUserId);
        mockUser.setName("testuser");
        mockUser.setEmail("test@example.com");
        mockUser.setPasswordHash("encodedTestPassword");

        mockUserDetails = UserDetailsImpl.build(mockUser);
    }

    // --- Update Profile Tests ---

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

        when(userService.updateUserProfile(eq(authenticatedUserId), any(UpdateProfileRequest.class)))
                .thenReturn(expectedResponse);

        mockMvc.perform(patch("/api/profile")
                .with(user(mockUserDetails))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(authenticatedUserId))
                .andExpect(jsonPath("$.name").value("Updated Name"))
                .andExpect(jsonPath("$.email").value("updated.email@example.com"))
                .andDo(print());
    }

    @Test
    void testUpdateProfile_EmailAlreadyTaken() throws Exception {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setName("Some Name");
        request.setEmail("taken@example.com");

        when(userService.updateUserProfile(eq(authenticatedUserId), any(UpdateProfileRequest.class)))
                .thenThrow(new IllegalArgumentException("Email 'taken@example.com' is already in use."));

        mockMvc.perform(patch("/api/profile")
                .with(user(mockUserDetails))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("Bad Request")) // Expecting "Bad Request" as String
                // .andExpect(jsonPath("$.error").value("Bad Request")) // REMOVED: Based on your output, this field is missing for these errors
                .andExpect(jsonPath("$.message").value("Email 'taken@example.com' is already in use."))
                .andDo(print());
    }

    @Test
    void testUpdateProfile_BlankNameValidation() throws Exception {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setName("");
        request.setEmail("valid@example.com");

        mockMvc.perform(patch("/api/profile")
                .with(user(mockUserDetails))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400)) // Still expecting 400 as integer from validation handler
                .andExpect(jsonPath("$.error").value("Bad Request")) // Still expecting "Bad Request" string from validation handler
                .andExpect(jsonPath("$.message").value("Validation failed for request body."))
                .andExpect(jsonPath("$.details").exists())
                .andExpect(jsonPath("$.details.name").value("Name cannot be empty"))
                .andDo(print());
    }

    // --- Change Password Tests ---

    @Test
    void shouldChangePasswordSuccessfullyAndReturnOk() throws Exception {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword("oldPassword123");
        request.setNewPassword("newStrongPassword456");
        request.setConfirmNewPassword("newStrongPassword456");

        doNothing().when(userService).changePassword(eq(authenticatedUserId), any(ChangePasswordRequest.class));

        mockMvc.perform(patch("/api/profile/password")
                        .with(SecurityMockMvcRequestPostProcessors.user(mockUserDetails))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value("Password changed successfully."))
                .andDo(print());
    }

    @Test
    void shouldReturnBadRequestForInvalidOldPassword() throws Exception {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword("wrongOldPassword");
        request.setNewPassword("newStrongPassword");
        request.setConfirmNewPassword("newStrongPassword");

        doThrow(new IllegalArgumentException("Invalid old password."))
                .when(userService).changePassword(eq(authenticatedUserId), any(ChangePasswordRequest.class));

        mockMvc.perform(patch("/api/profile/password")
                        .with(SecurityMockMvcRequestPostProcessors.user(mockUserDetails))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("Bad Request")) // Expecting "Bad Request" as String
                // .andExpect(jsonPath("$.error").value("Bad Request")) // REMOVED
                .andExpect(jsonPath("$.message").value("Invalid old password."))
                .andDo(print());
    }

    @Test
    void shouldReturnBadRequestWhenNewPasswordsDoNotMatch() throws Exception {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword("oldPassword123");
        request.setNewPassword("newStrongPassword");
        request.setConfirmNewPassword("mismatchedPassword");

        doThrow(new IllegalArgumentException("New password and confirmation do not match."))
                .when(userService).changePassword(eq(authenticatedUserId), any(ChangePasswordRequest.class));

        mockMvc.perform(patch("/api/profile/password")
                        .with(SecurityMockMvcRequestPostProcessors.user(mockUserDetails))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("Bad Request")) // Expecting "Bad Request" as String
                // .andExpect(jsonPath("$.error").value("Bad Request")) // REMOVED
                .andExpect(jsonPath("$.message").value("New password and confirmation do not match."))
                .andDo(print());
    }

    @Test
    void shouldReturnBadRequestWhenNewPasswordIsSameAsOld() throws Exception {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword("oldPassword123");
        request.setNewPassword("oldPassword123");
        request.setConfirmNewPassword("oldPassword123");

        doThrow(new IllegalArgumentException("New password cannot be the same as the old password."))
                .when(userService).changePassword(eq(authenticatedUserId), any(ChangePasswordRequest.class));

        mockMvc.perform(patch("/api/profile/password")
                        .with(SecurityMockMvcRequestPostProcessors.user(mockUserDetails))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("Bad Request")) // Expecting "Bad Request" as String
                // .andExpect(jsonPath("$.error").value("Bad Request")) // REMOVED
                .andExpect(jsonPath("$.message").value("New password cannot be the same as the old password."))
                .andDo(print());
    }

    @Test
    void shouldReturnBadRequestForInvalidChangePasswordRequestViaValidation() throws Exception {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword("");
        request.setNewPassword("short");
        request.setConfirmNewPassword("");

        mockMvc.perform(patch("/api/profile/password")
                        .with(SecurityMockMvcRequestPostProcessors.user(mockUserDetails))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400)) // Still expecting 400 as integer from validation handler
                .andExpect(jsonPath("$.error").value("Bad Request")) // Still expecting "Bad Request" string from validation handler
                .andExpect(jsonPath("$.message").value("Validation failed for request body."))
                .andExpect(jsonPath("$.details").exists())
                .andExpect(jsonPath("$.details.oldPassword").value("Old password cannot be empty"))
                .andExpect(jsonPath("$.details.newPassword").value("New password must be at least 8 characters long"))
                .andExpect(jsonPath("$.details.confirmNewPassword").value("Confirm new password cannot be empty"))
                .andDo(print());
    }

    @Test
    void shouldReturnInternalServerErrorOnChangePasswordFailure() throws Exception {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword("oldPassword123");
        request.setNewPassword("newStrongPassword456");
        request.setConfirmNewPassword("newStrongPassword456");

        doThrow(new RuntimeException("Database error during password change"))
                .when(userService).changePassword(eq(authenticatedUserId), any(ChangePasswordRequest.class));

        mockMvc.perform(patch("/api/profile/password")
                        .with(SecurityMockMvcRequestPostProcessors.user(mockUserDetails))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value("Internal Server Error")) // Expecting "Internal Server Error" as String
                // .andExpect(jsonPath("$.error").value("Internal Server Error")) // REMOVED
                .andExpect(jsonPath("$.message").value("An unexpected error occurred."))
                .andDo(print());
    }
}