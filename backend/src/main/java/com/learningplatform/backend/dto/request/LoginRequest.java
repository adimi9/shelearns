// define what information is expected from the frontend for a signup operation
package com.learningplatform.backend.dto.request;

import jakarta.validation.constraints.Email; // validation for email format
import jakarta.validation.constraints.NotBlank; // validation to check that field cannot be empty
import jakarta.validation.constraints.Size; // validation to check string length

public class LoginRequest {
    @NotBlank(message = "Email cannot be empty") // field must not be blank
    @Email(message = "Email must be valid") // field must be a valid email
    private String email;

    @NotBlank(message = "Password cannot be empty") // field must not be blank
    @Size(min = 8, message = "Password must be at least 8 characters long") // field must be at least 8 characters long
    private String password;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}