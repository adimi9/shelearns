package com.learningplatform.backend.features.onboarding.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE) // HTTP 503, or INTERNAL_SERVER_ERROR (500)
public class FastApiCommunicationException extends RuntimeException {
    public FastApiCommunicationException(String message, Throwable cause) {
        super(message, cause);
    }

    public FastApiCommunicationException(String message) {
        super(message);
    }
}
