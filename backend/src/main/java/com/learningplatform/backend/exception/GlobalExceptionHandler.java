// src/main/java/com/learningplatform/backend/advice/GlobalExceptionHandler.java
package com.learningplatform.backend.exception; // Ensure this package is scanned by Spring

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice // This annotation makes this class a global exception handler
public class GlobalExceptionHandler {

    // Handler for validation errors (@Valid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST) // Sets the HTTP status code for this exception
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", HttpStatus.BAD_REQUEST.value());
        response.put("error", "Bad Request");
        response.put("message", "Validation failed for request body.");

        // Collect all field errors into a map or list
        Map<String, String> errors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        fieldError -> fieldError.getField(),
                        fieldError -> fieldError.getDefaultMessage() != null ? fieldError.getDefaultMessage() : "Invalid value"
                ));
        response.put("details", errors); // Provide details of which fields failed validation

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    // You already have logic for IllegalArgumentException in AuthController,
    // but moving it to a global handler is often cleaner.
    // If you keep it in AuthController, that's fine for now, but this is how it would look globally:
    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.CONFLICT) // For email already in use
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(IllegalArgumentException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("message", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    // Generic exception handler for any unhandled exceptions
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "An unexpected error occurred.");
        // In production, log the full stack trace, don't expose it to the client
        // response.put("error", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}