package com.learningplatform.backend.features.auth.dto.response;

public class SignupResponseDto {
    private String token;

    // constructors 
    public SignupResponseDto() {}

    public SignupResponseDto(String token) {
        this.token = token;
    }

    // getters and setters 
    public String getToken() { return token; }  
    public void setToken(String token) { this.token = token; }
}
