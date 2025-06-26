// File: src/main/java/com/learningplatform/backend/controller/AuthController.java
package com.learningplatform.backend.controller;

import com.learningplatform.backend.dto.request.LoginRequest;
import com.learningplatform.backend.dto.request.SignupRequest;
import com.learningplatform.backend.dto.response.LoginResponse; // For successful login response with JWT
import com.learningplatform.backend.dto.response.ErrorResponse; // For consistent error responses
import com.learningplatform.backend.model.User; // Still needed if registerUser returns User
import com.learningplatform.backend.service.AuthService;

import jakarta.servlet.http.HttpServletRequest; // For getting the request URI for ErrorResponse
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException; // Specific exception for login errors
import org.springframework.web.bind.annotation.*;

import java.util.Map; // Still needed if registerUser uses Map.of()

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // POST request to /api/auth/signup endpoint [Register operation]
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(
            @Valid @RequestBody SignupRequest signupRequest,
            HttpServletRequest request // Added for ErrorResponse path
    ) {
        try {
            User registeredUser = authService.registerUser(signupRequest);

            // Keeping Map.of for simplicity here as it's not a JWT login,
            // but for consistency across your API, consider creating a SignupResponse DTO.
            return ResponseEntity.ok(Map.of(
                    "message", "User registered successfully!",
                    "userId", registeredUser.getId(),
                    "email", registeredUser.getEmail()
            ));
        } catch (IllegalArgumentException e) {
            // Handle errors from AuthService (e.g., email/name already in use)
            return ResponseEntity.status(HttpStatus.CONFLICT)
                                 .body(new ErrorResponse("Conflict", e.getMessage(), request.getRequestURI()));
        } catch (Exception e) {
            // Handle any other unexpected errors -> send back an HTTP 500 Internal Server Error
            // In production, log the full exception details (e.printStackTrace()) for debugging,
            // but return a generic message to the client for security.
            System.err.println("An unexpected error occurred during registration: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(new ErrorResponse("Internal Server Error", "An error occurred during registration.", request.getRequestURI()));
        }
    }

    // POST request to /api/auth/login endpoint [Login operation]
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(
            @Valid @RequestBody LoginRequest loginRequest,
            HttpServletRequest request // Added for ErrorResponse path
    ) {
        try {
            // Authenticate user using AuthService, which now returns LoginResponse with JWT
            LoginResponse loginResponse = authService.loginUser(loginRequest);

            // If authentication is successful, return HTTP 200 OK with the LoginResponse DTO
            return ResponseEntity.ok(loginResponse);

        } catch (AuthenticationException e) {
            // Specifically catch Spring Security's AuthenticationException.
            // This typically covers cases like BadCredentialsException (invalid password)
            // or if the UserDetailsService cannot find the user (though it's usually wrapped).
            System.err.println("Authentication error during login: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                 .body(new ErrorResponse("Unauthorized", "Invalid email or password.", request.getRequestURI()));
        } catch (IllegalArgumentException e) {
            // This block is for custom validation errors thrown by AuthService *before* Spring Security's authentication,
            // if any were added beyond just authentication failures.
            System.err.println("Login request validation/logic error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                 .body(new ErrorResponse("Bad Request", e.getMessage(), request.getRequestURI()));
        } catch (Exception e) {
            // Catch any other unexpected errors during the login process.
            System.err.println("An error occurred during login: " + e.getMessage());
            e.printStackTrace(); // For development, use a logger in production

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(new ErrorResponse("Internal Server Error", "An error occurred during login.", request.getRequestURI()));
        }
    }
}