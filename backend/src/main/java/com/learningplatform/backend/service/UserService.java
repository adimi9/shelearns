package com.learningplatform.backend.service;

import com.learningplatform.backend.model.User;
import com.learningplatform.backend.repository.UserRepository;

import com.learningplatform.backend.dto.request.UpdateProfileRequest;
import com.learningplatform.backend.dto.response.UpdateProfileResponse;
import com.learningplatform.backend.dto.request.ChangePasswordRequest; // NEW: Import ChangePasswordRequest

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder; // NEW: Import PasswordEncoder

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // NEW: Inject PasswordEncoder

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) { // NEW: Add PasswordEncoder to constructor
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder; // Assign it
    }

    @Transactional
    public UpdateProfileResponse updateUserProfile(Long authenticatedUserId, UpdateProfileRequest updateRequest) {
        // 1. Fetch the user from the database using the authenticatedUserId
        User user = userRepository.findById(authenticatedUserId)
            .orElseThrow(() -> new IllegalArgumentException("User not found for update. This should not happen for an authenticated user."));

        // 2. Apply updates from the UpdateProfileRequest DTO to the User entity

        // Update User's 'name'
        if (updateRequest.getName() != null) {
            if (!updateRequest.getName().isBlank()) {
                if (!user.getName().equals(updateRequest.getName())) {
                    if (userRepository.existsByName(updateRequest.getName())) {
                        throw new IllegalArgumentException("Name '" + updateRequest.getName() + "' is already taken.");
                    }
                    user.setName(updateRequest.getName());
                }
            } else {
                throw new IllegalArgumentException("Name cannot be empty.");
            }
        } else {
            // Consider if name should be optional in PATCH. If so, remove this exception.
            // For now, it's required as per your initial code.
            throw new IllegalArgumentException("Name field is missing in the request.");
        }

        // Update User's 'email'
        if (updateRequest.getEmail() != null) {
            if (!updateRequest.getEmail().isBlank()) {
                if (!user.getEmail().equals(updateRequest.getEmail())) {
                    if (userRepository.existsByEmail(updateRequest.getEmail())) {
                        throw new IllegalArgumentException("Email '" + updateRequest.getEmail() + "' is already in use.");
                    }
                    user.setEmail(updateRequest.getEmail());
                }
            } else {
                throw new IllegalArgumentException("Email cannot be empty.");
            }
        } else {
            // Consider if email should be optional in PATCH. If so, remove this exception.
            throw new IllegalArgumentException("Email field is missing in the request.");
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

    // NEW METHOD: Change User Password
    @Transactional
    public void changePassword(Long authenticatedUserId, ChangePasswordRequest changePasswordRequest) {
        User user = userRepository.findById(authenticatedUserId)
            .orElseThrow(() -> new IllegalArgumentException("User not found for password change. This should not happen for an authenticated user."));

        // 1. Verify old password
        if (!passwordEncoder.matches(changePasswordRequest.getOldPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid old password.");
        }

        // 2. Verify new password matches confirmation
        if (!changePasswordRequest.getNewPassword().equals(changePasswordRequest.getConfirmNewPassword())) {
            throw new IllegalArgumentException("New password and confirmation do not match.");
        }

        // 3. Optional: Prevent changing to the same password (good practice)
        if (passwordEncoder.matches(changePasswordRequest.getNewPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("New password cannot be the same as the old password.");
        }

        // 4. Encode and set the new password
        user.setPasswordHash(passwordEncoder.encode(changePasswordRequest.getNewPassword()));

        // 5. Save the updated user (password hash)
        userRepository.save(user);
    }
}