// controls all operations defined, handles interaction in response to frontend request
package com.learningplatform.backend.controller;

import com.learningplatform.backend.dto.SignupRequest;
import com.learningplatform.backend.model.User;
import com.learningplatform.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

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
        // validate request JSON using SignupRequest DTO
        // - convert JSON to SignupRequest object
        // - trigger validation rules (NotBlank, Email, Size) defined
        @Valid @RequestBody SignupRequest signupRequest
    // only proceed if validation checks are successful
    ) {
        try {
            // once validated, AuthService will perform business logic to register a user into the website
            User registeredUser = authService.registerUser(signupRequest);

            // if successful, return a success response (HTTP 200 OK) with basic user info (ID, email)
            return ResponseEntity.ok(Map.of(
                    "message", "User registered successfully!",
                    "userId", registeredUser.getId(),
                    "email", registeredUser.getEmail()
            ));
        } catch (IllegalArgumentException e) {
            // handle errors from AuthService
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            // handle any other unexpected errors -> send back an HTTP 500 Internal Server Error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "An error occurred during registration."));
        }
    }
}