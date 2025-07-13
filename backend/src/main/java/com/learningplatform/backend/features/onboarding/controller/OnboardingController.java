package com.learningplatform.backend.features.onboarding.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus; // Import HttpStatus
import org.springframework.http.MediaType; // Import MediaType
import org.springframework.http.ResponseEntity;

import com.learningplatform.backend.features.onboarding.dto.request.OnboardingRequestDto;
import com.learningplatform.backend.features.onboarding.dto.response.OnboardingSuccessResponseDto; // Import new DTO
import com.learningplatform.backend.features.onboarding.service.PersonalizationService;

// Authentication
import org.springframework.security.core.annotation.AuthenticationPrincipal;

// Validation
import jakarta.validation.Valid;

// Exceptions
import com.learningplatform.backend.common.dto.response.ErrorResponse;
import com.learningplatform.backend.features.onboarding.exception.UserNotFoundException;
import com.learningplatform.backend.features.onboarding.exception.FastApiCommunicationException;

@RestController
@RequestMapping("/api/onboarding")
public class OnboardingController {

    private final PersonalizationService personalizationService;

    public OnboardingController(PersonalizationService personalizationService) {
        this.personalizationService = personalizationService;
    }

    @PostMapping
    public ResponseEntity<OnboardingSuccessResponseDto> personalize( // Change return type
        @AuthenticationPrincipal Long userId,
        @Valid @RequestBody OnboardingRequestDto requestDto) {

        String successMessage = personalizationService.generateAndSavePersonalizedRoadmap(userId, requestDto);

        // Return HTTP 200 OK with the success message in a JSON object
        return ResponseEntity.ok(new OnboardingSuccessResponseDto(successMessage));
    }

    // --- Exception Handlers for OnboardingController ---

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFoundException(UserNotFoundException ex) {
        ErrorResponse error = new ErrorResponse(ex.getMessage(), HttpStatus.NOT_FOUND.value());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                             .contentType(MediaType.APPLICATION_JSON)
                             .body(error);
    }

    @ExceptionHandler(FastApiCommunicationException.class)
    public ResponseEntity<ErrorResponse> handleFastApiCommunicationException(FastApiCommunicationException ex) {
        ErrorResponse error = new ErrorResponse(ex.getMessage(), HttpStatus.SERVICE_UNAVAILABLE.value());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                             .contentType(MediaType.APPLICATION_JSON)
                             .body(error);
    }

    // You might also want a generic RuntimeException handler here if not already in a GlobalExceptionHandler
    // @ExceptionHandler(RuntimeException.class)
    // public ResponseEntity<ErrorResponse> handleGenericRuntimeException(RuntimeException ex) {
    //     ErrorResponse error = new ErrorResponse("An unexpected server error occurred: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value());
    //     return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
    //                          .contentType(MediaType.APPLICATION_JSON)
    //                          .body(error);
    // }
}