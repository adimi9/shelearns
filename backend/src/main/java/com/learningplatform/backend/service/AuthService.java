// File: src/main/java/com/learningplatform/backend/service/AuthService.java

package com.learningplatform.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // NEW: Import for @Transactional

import com.learningplatform.backend.model.Role;
import com.learningplatform.backend.model.User;
import com.learningplatform.backend.model.UserProfile;
import com.learningplatform.backend.model.Avatar;
import com.learningplatform.backend.model.enums.EAvatar;
import com.learningplatform.backend.model.enums.ERole;

import com.learningplatform.backend.repository.AvatarRepository;
import com.learningplatform.backend.repository.RoleRepository;
import com.learningplatform.backend.repository.UserRepository;

import com.learningplatform.backend.dto.request.LoginRequest;
import com.learningplatform.backend.dto.request.SignupRequest;
import com.learningplatform.backend.dto.response.LoginResponse; // NEW: Import LoginResponse DTO

import com.learningplatform.backend.security.jwt.JwtUtils; // NEW: Import JwtUtils
import com.learningplatform.backend.security.services.UserDetailsImpl; // NEW: Import UserDetailsImpl

import org.springframework.security.authentication.AuthenticationManager; // NEW: Import AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken; // NEW: Import for login
import org.springframework.security.core.Authentication; // NEW: Import for authentication result
import org.springframework.security.core.context.SecurityContextHolder; // NEW: To set context after login
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AvatarRepository avatarRepository;
    private final PasswordEncoder passwordEncoder;

    // NEW: Injected Spring Security components for login
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    // Updated Constructor for dependency injection
    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       RoleRepository roleRepository,
                       AvatarRepository avatarRepository,
                       AuthenticationManager authenticationManager, // NEW
                       JwtUtils jwtUtils) { // NEW
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
        this.avatarRepository = avatarRepository;
        this.authenticationManager = authenticationManager; // NEW
        this.jwtUtils = jwtUtils; // NEW
    }

    // 1. Register user into website
    @Transactional // Apply @Transactional here because it performs multiple database writes (User, UserProfile)
    public User registerUser(SignupRequest signupRequest) {

        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new IllegalArgumentException("Email address already in use.");
        }

        if (userRepository.existsByName(signupRequest.getName())) {
            throw new IllegalArgumentException("Name already in use.");
        }

        String hashedPassword = passwordEncoder.encode(signupRequest.getPassword());

        Role role = roleRepository
                             .findByName(ERole.ROLE_USER)
                             .orElseThrow(() -> new RuntimeException("Error: Role 'ROLE_USER' not found. Please ensure roles are pre-populated."));

        User user = new User(
                signupRequest.getName(),
                signupRequest.getEmail(),
                hashedPassword,
                role
        );

        Avatar avatar = avatarRepository
                             .findByName(EAvatar.AVATAR_TECH_GIRL)
                             .orElseThrow(() -> new RuntimeException("Error: Avatar 'AVATAR_TECH_GIRL' not found. Please ensure avatars are pre-populated.")); // Corrected error message

        UserProfile userProfile = new UserProfile(
                avatar
        );

        user.setUserProfile(userProfile); // This will be saved/updated via CascadeType.ALL on User

        return userRepository.save(user);
    }

    // 2. Login user into website - Now with JWT generation!
    @Transactional // Apply @Transactional here as it involves reading user data and potentially lazy loading (though less critical for read-only)
    public LoginResponse loginUser(LoginRequest loginRequest) {

        // Use Spring Security's AuthenticationManager to authenticate credentials
        // This will automatically involve your UserDetailsService and PasswordEncoder
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        // Set the authenticated user in the SecurityContextHolder
        // This is crucial for Spring Security to know who is logged in for the current request context
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Get your custom UserDetailsImpl object from the authenticated principal
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();

        // Generate the JWT token using your JwtUtils
        String jwt = jwtUtils.generateJwtToken(userPrincipal);

        // Construct and return the LoginResponse DTO
        return new LoginResponse(
                jwt,
                userPrincipal.getId(),
                userPrincipal.getName(),
                userPrincipal.getEmail(),
                userPrincipal.getAuthorities().stream()
                             .findFirst() // Assuming a single role, get the first one
                             .map(grantedAuthority -> grantedAuthority.getAuthority())
                             .orElse("ROLE_UNKNOWN") // Fallback if no roles are found
        );
    }
}