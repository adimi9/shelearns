// perform business actions on data (which has been validated by SignupRequest)
package com.learningplatform.backend.service;

import com.learningplatform.backend.model.Role;
import com.learningplatform.backend.model.User;
import com.learningplatform.backend.model.enums.ERole;
import com.learningplatform.backend.repository.RoleRepository;
import com.learningplatform.backend.repository.UserRepository;
import com.learningplatform.backend.dto.request.LoginRequest; // NEW Import
import com.learningplatform.backend.dto.request.SignupRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;
import java.util.Optional; // NEW Import

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
    }

    // 1. register user into website
    public User registerUser(SignupRequest signupRequest) {
        // check for existing email
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            // if email exists, throw an error (will be caught by Controller)
            throw new IllegalArgumentException("Email address already in use.");
        }

        // hash the password using BCryptPasswordEncoder
        String hashedPassword = passwordEncoder.encode(signupRequest.getPassword());

        Set<Role> roles = new HashSet<>();

        // Find the ROLE_USER from the database
        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Error: Role 'ROLE_USER' not found. Please ensure roles are pre-populated."));
        roles.add(userRole);

        // Create a new User model using the hashed password and assigned roles
        User user = new User(
                signupRequest.getName(),
                signupRequest.getEmail(),
                hashedPassword,
                roles
        );

        // save the new User model to the database
        return userRepository.save(user); // Returns the saved User entity
    }

    // 2. login user into website
    public User loginUser(LoginRequest loginRequest) {
        // Find user by email
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());

        // Check if user exists
        if (userOptional.isEmpty()) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        User user = userOptional.get();

        // Verify password
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        // If email and password are correct, return the user
        return user;
    }

    // 3. allow user to reset password
}