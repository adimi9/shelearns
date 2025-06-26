// src/main/java/com/example/backend/payload/response/JwtResponse.java
package com.learningplatform.backend.dto.response;

import java.util.List;

public class JwtResponse {
    private String token;
    private String type = "Bearer"; // Standard for JWTs
    private Long id;
    private String name; // User's name (optional, but useful)
    private String email;
    private List<String> roles; // If your application uses roles/authorities

    // --- Constructor ---
    public JwtResponse(String accessToken, Long id, String name, String email, List<String> roles) {
        this.token = accessToken;
        this.id = id;
        this.name = name;
        this.email = email;
        this.roles = roles;
    }

    // --- Getters and Setters ---
    public String getAccessToken() { return token; }
    public void setAccessToken(String accessToken) { this.token = accessToken; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Long getId() { return id;}
    public void setId(Long id) { this.id = id;}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email;}
    public void setEmail(String email) { this.email = email; }

    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
}