package com.learningplatform.backend.dto.response;

public class UpdateProfileResponse {
    private Long id;
    private String name;
    private String email;

    // Constructor to build the response from your User entity
    public UpdateProfileResponse(Long id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    // Default constructor (often needed for deserialization)
    public UpdateProfileResponse() {}

    // --- Getters and Setters ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}