package com.learningplatform.backend.dto.response;

public class SignupResponse {
    private String message;
    private Long userId;
    private String name;
    private String email;
    private String token;

    public SignupResponse(String message, Long userId, String name, String email, String token) {
        this.message = message;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.token = token;
    }

    public String getMessage() {
        return message;
    }

    public Long getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getToken() {
        return token;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
