package com.learningplatform.backend.exception;

// overall
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

// exceptions handled
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.security.core.AuthenticationException;

// returns 
import org.springframework.http.ResponseEntity;
import com.learningplatform.backend.dto.response.ErrorResponse;

// uses
import jakarta.servlet.http.HttpServletRequest;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;
import org.springframework.http.HttpStatus;

// logging
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class) // automatically throw exception when a controller method throws a `MethodArgumentNotValidException` (aka fails validation)

    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {

        Map<String, String> errors = ex.getBindingResult().getFieldErrors().stream() // extract each field that failed validation
                .collect(Collectors.toMap(
                        field -> field.getField(), // name of field 
                        field -> field.getDefaultMessage() != null ? field.getDefaultMessage() : "Invalid value" // human readable message from annotation
                ));

        // build the full response body 
        Map<String, Object> body = new HashMap<>();
        body.put("status", 400); // 400 Bad Request 
        body.put("message", "Validation failed"); // general description of the error 
        body.put("details", errors); // specific field validation errors map 

        // return the HTTP 400 (Bad Request) response
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(AuthenticationException.class) // automatically throw exception when a controller method throws a `AuthenticationException` (aka fails authentication)
  
    public ResponseEntity<ErrorResponse> handleAuthException(AuthenticationException ex, HttpServletRequest request) {

        ErrorResponse errorResponse = new ErrorResponse(
            HttpStatus.UNAUTHORIZED.value(), 
            HttpStatus.UNAUTHORIZED.getReasonPhrase(),
            "Invalid email or password.",
            request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }   

    @ExceptionHandler(IllegalArgumentException.class) // thrown when invalid arguments are passed (bad request)

    public ResponseEntity<ErrorResponse> handleIllegalArgs(IllegalArgumentException ex, HttpServletRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),           
            HttpStatus.BAD_REQUEST.getReasonPhrase(), 
            ex.getMessage(),                           
            request.getRequestURI()                  
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    @ExceptionHandler(Exception.class) // fallback for all other uncaught exceptions (internal server error)

    public ResponseEntity<ErrorResponse> handleAllOther(Exception ex, HttpServletRequest request) {
        
        // log the exception details for debugging purposes
        logger.error("Unhandled exception caught", ex);

        ErrorResponse errorResponse = new ErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),            
            HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),  
            "An unexpected error occurred.",                     
            request.getRequestURI()                               
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}
