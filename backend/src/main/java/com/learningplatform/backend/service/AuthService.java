// perform business actions on data (which has been validated by SignupRequest)
package com.learningplatform.backend.service;

import com.learningplatform.backend.model.User;
import com.learningplatform.backend.repository.UserRepository;
import com.learningplatform.backend.dto.SignupRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
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

        // create a new User model using the hashed password
        User user = new User(
                signupRequest.getName(),
                signupRequest.getEmail(),
                hashedPassword
        );

        // save the new User model to the database
        return userRepository.save(user); // Returns the saved User entity
    }

    // 2. login user into website

    // 3. allow user to reset password
}