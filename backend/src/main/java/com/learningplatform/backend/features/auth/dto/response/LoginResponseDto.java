package com.learningplatform.backend.features.auth.dto.response;

public class LoginResponseDto {
    private String token;

    // constructors 
    public LoginResponseDto() {}

    public LoginResponseDto(String token) {
        this.token = token;
    }

    // getters and setters 
    public String getToken() { return token; }  
    public void setToken(String token) { this.token = token; }
}
