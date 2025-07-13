package com.learningplatform.backend.features.auth.controller;

import com.learningplatform.backend.features.auth.service.AuthService;
import com.learningplatform.backend.features.auth.dto.request.*;
import com.learningplatform.backend.features.auth.dto.response.LoginResponseDto;
import com.learningplatform.backend.features.auth.dto.response.SignupResponseDto;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

// exceptions 
import com.learningplatform.backend.common.dto.response.ErrorResponse;
import com.learningplatform.backend.features.auth.exception.signup.EmailAlreadyRegisteredException;
import com.learningplatform.backend.features.auth.exception.signup.UsernameAlreadyTakenException;
import com.learningplatform.backend.features.auth.exception.login.InvalidCredentialsException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<SignupResponseDto> signup(@Valid @RequestBody SignupRequestDto dto) {
        SignupResponseDto response = authService.signup(dto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto dto) {
        LoginResponseDto response = authService.login(dto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody ChangePasswordRequestDto dto) {

        authService.changePassword(userId, dto);
        return ResponseEntity.ok().build();
    }

    // Exception Handlers 
    @ExceptionHandler(EmailAlreadyRegisteredException.class)
    public ResponseEntity<ErrorResponse> handleEmailAlreadyRegisteredException(EmailAlreadyRegisteredException ex) {
        ErrorResponse error = new ErrorResponse(ex.getMessage(), HttpStatus.CONFLICT.value());
        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(UsernameAlreadyTakenException.class)
    public ResponseEntity<ErrorResponse> handleUsernameAlreadyTakenException(UsernameAlreadyTakenException ex) {
        ErrorResponse error = new ErrorResponse(ex.getMessage(), HttpStatus.CONFLICT.value());
        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(InvalidCredentialsException.class) // New handler for login errors
    public ResponseEntity<ErrorResponse> handleInvalidCredentialsException(InvalidCredentialsException ex) {
        ErrorResponse error = new ErrorResponse(ex.getMessage(), HttpStatus.UNAUTHORIZED.value()); // Or HttpStatus.BAD_REQUEST
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED) // Or HttpStatus.BAD_REQUEST
                             .contentType(MediaType.APPLICATION_JSON)
                             .body(error);
    }
}
