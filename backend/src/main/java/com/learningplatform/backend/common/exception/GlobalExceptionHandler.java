package com.learningplatform.backend.common.exception; // Or appropriate package

import com.learningplatform.backend.common.dto.response.ErrorResponse;
// Remove imports for EmailAlreadyRegisteredException and UsernameAlreadyTakenException
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    // This will catch any RuntimeException not specifically handled by a controller's @ExceptionHandler
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleGenericRuntimeException(RuntimeException ex) {
        // Log the exception for debugging purposes (e.g., using SLF4J/Logback)
        // logger.error("An unexpected runtime error occurred: {}", ex.getMessage(), ex);

        // For security, avoid exposing internal exception details in production
        String errorMessage = "An unexpected error occurred.";
        if (ex.getMessage() != null && !ex.getMessage().isEmpty()) {
            errorMessage = ex.getMessage(); // Still pass the message if it's there and meaningful
        }
        ErrorResponse error = new ErrorResponse(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR.value());
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // You can add handlers for other common Spring exceptions here, e.g.:
    // @ExceptionHandler(MethodArgumentNotValidException.class)
    // public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
    //     List<String> errors = ex.getBindingResult()
    //                             .getFieldErrors()
    //                             .stream()
    //                             .map(error -> error.getField() + ": " + error.getDefaultMessage())
    //                             .collect(Collectors.toList());
    //     ErrorResponse error = new ErrorResponse("Validation failed: " + String.join(", ", errors), HttpStatus.BAD_REQUEST.value());
    //     return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    // }

    // @ExceptionHandler(Exception.class) // Catch-all for any other unhandled exceptions
    // public ResponseEntity<ErrorResponse> handleAllExceptions(Exception ex) {
    //     ErrorResponse error = new ErrorResponse("An unhandled error occurred.", HttpStatus.INTERNAL_SERVER_ERROR.value());
    //     return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    // }
}