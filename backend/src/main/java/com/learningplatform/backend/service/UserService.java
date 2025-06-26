package com.learningplatform.backend.service;

import com.learningplatform.backend.model.User;
import com.learningplatform.backend.repository.UserRepository; // Your Spring Data JPA User repository

import com.learningplatform.backend.dto.request.UpdateProfileRequest;
import com.learningplatform.backend.dto.response.UpdateProfileResponse;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    // UserProfileRepository is definitely not needed here as this service
    // now only updates User's name and email.

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional // Ensures atomicity of the operation
    public UpdateProfileResponse updateUserProfile(Long authenticatedUserId, UpdateProfileRequest updateRequest) {
        // 1. Fetch the user from the database using the authenticatedUserId
        User user = userRepository.findById(authenticatedUserId)
            .orElseThrow(() -> new IllegalArgumentException("User not found for update. This should not happen for an authenticated user."));

        // 2. Apply updates from the UpdateProfileRequest DTO to the User entity

        // Update User's 'name'
        // Using `equals()` check to prevent unnecessary database updates
        // and to ensure uniqueness check only if name is actually changing.
        if (updateRequest.getName() != null) {
            if (!updateRequest.getName().isBlank()) {
                if (!user.getName().equals(updateRequest.getName())) { // Only proceed if name is different
                    // Check for uniqueness if 'name' must be unique across all users
                    if (userRepository.existsByName(updateRequest.getName())) {
                        throw new IllegalArgumentException("Name '" + updateRequest.getName() + "' is already taken.");
                    }
                    user.setName(updateRequest.getName());
                }
            } else {
                throw new IllegalArgumentException("Name cannot be empty."); // Match @NotBlank behavior if needed here
            }
        } else {
            throw new IllegalArgumentException("Name field is missing in the request."); // Or handle as per your API design (e.g., allow partial update if name is optional)
        }


        // Update User's 'email'
        if (updateRequest.getEmail() != null) {
            if (!updateRequest.getEmail().isBlank()) {
                if (!user.getEmail().equals(updateRequest.getEmail())) { // Only proceed if email is different
                    // Critical: Email must be unique.
                    if (userRepository.existsByEmail(updateRequest.getEmail())) {
                        throw new IllegalArgumentException("Email '" + updateRequest.getEmail() + "' is already in use.");
                    }
                    user.setEmail(updateRequest.getEmail());
                    // Consider adding email verification process here if changing email requires re-verification
                }
            } else {
                throw new IllegalArgumentException("Email cannot be empty."); // Match @NotBlank behavior if needed here
            }
        } else {
            throw new IllegalArgumentException("Email field is missing in the request."); // Or handle as per your API design
        }


        // 3. Save the updated User entity
        User updatedUser = userRepository.save(user);

        // 4. Convert the updated User entity to the UpdateProfileResponse DTO
        return new UpdateProfileResponse(
            updatedUser.getId(),
            updatedUser.getName(),
            updatedUser.getEmail()
        );
    }
}