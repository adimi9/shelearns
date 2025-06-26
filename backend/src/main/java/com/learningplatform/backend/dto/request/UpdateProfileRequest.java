// define what information is expected from the frontend for a signup operation
package com.learningplatform.backend.dto.request;

import jakarta.validation.constraints.Email; 
import jakarta.validation.constraints.NotBlank;

public class UpdateProfileRequest {
    @NotBlank(message = "Name cannot be empty") // field must not be blank
    private String name;

    @NotBlank(message = "Email cannot be empty") // field must not be blank
    @Email(message = "Email must be valid") // field must be a valid email
    private String email;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
}