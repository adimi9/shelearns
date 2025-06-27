package com.learningplatform.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

    // Handles validation errors from @Valid / @Validated annotations
    // This handler seems to be working perfectly and producing the desired output with integer status and 'details' map.
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST) // HTTP 400
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("status", HttpStatus.BAD_REQUEST.value()); // This is an integer (400)
        response.put("error", HttpStatus.BAD_REQUEST.getReasonPhrase()); // "Bad Request" as String
        response.put("message", "Validation failed for request body.");

        Map<String, String> errors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        fieldError -> fieldError.getField(),
                        fieldError -> fieldError.getDefaultMessage() != null ? fieldError.getDefaultMessage() : "Invalid value"
                ));
        response.put("details", errors);

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    // Handles IllegalArgumentException
    // Based on your latest 'print()' output, Spring's default error controller seems to take over
    // and DOES NOT include an "error" field when the "status" is already the reason phrase.
    // We will align with this observed behavior for these exceptions.
    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST) // Still setting to 400 to match observed behavior
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(IllegalArgumentException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("status", HttpStatus.BAD_REQUEST.getReasonPhrase()); // "Bad Request" as string
        // REMOVED: response.put("error", HttpStatus.BAD_REQUEST.getReasonPhrase()); // This field is missing in your actual output
        response.put("message", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    // Catches all other uncaught exceptions (fallback)
    // Similar to IllegalArgumentException, the 'error' field seems to be missing in actual output.
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR) // HTTP 500
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        Map<String, String> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase()); // "Internal Server Error" as string
        // REMOVED: response.put("error", HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase()); // This field is missing in your actual output
        response.put("message", "An unexpected error occurred.");
        // In a real application, you would log 'ex' here for debugging:
        // logger.error("Unhandled exception: ", ex);
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}