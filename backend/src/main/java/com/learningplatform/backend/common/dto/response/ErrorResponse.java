package com.learningplatform.backend.common.dto.response;

public class ErrorResponse {
    private String status; // e.g., "Bad Request", "Unauthorized", "Internal Server Error"
    private String message; // A more detailed message about the error
    private Long timestamp; // When the error occurred (useful for logging/debugging)
    private String path;    // The request path that caused the error (useful for debugging)

    // Constructor
    public ErrorResponse(String status, String message, String path) {
        this.status = status;
        this.message = message;
        this.path = path;
        this.timestamp = System.currentTimeMillis();
    }

    // Default constructor for deserialization if needed
    public ErrorResponse() {}

    // --- Getters (and Setters if you need to deserialize incoming error responses, less common) ---
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }
}