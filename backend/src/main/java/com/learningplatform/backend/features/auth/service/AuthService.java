package com.learningplatform.backend.features.auth.service;

import com.learningplatform.backend.features.auth.dto.request.*;
import com.learningplatform.backend.features.auth.dto.response.LoginResponseDto;
import com.learningplatform.backend.features.auth.dto.response.SignupResponseDto;
import com.learningplatform.backend.features.auth.util.JwtUtil;
import com.learningplatform.backend.model.user.User;
import com.learningplatform.backend.model.user.profile.UserProfile;
import com.learningplatform.backend.repository.user.UserRepository;
import com.learningplatform.backend.repository.user.profile.UserProfileRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate; // Import LocalDate
import java.util.Set;

// exceptions
import com.learningplatform.backend.features.auth.exception.signup.EmailAlreadyRegisteredException;
import com.learningplatform.backend.features.auth.exception.signup.UsernameAlreadyTakenException;
import com.learningplatform.backend.features.auth.exception.login.InvalidCredentialsException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       UserProfileRepository userProfileRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public SignupResponseDto signup(SignupRequestDto dto) {

        // Check if a user with the email is already present
        if (userRepository.findByEmail(dto.getEmail()).isPresent())
            throw new EmailAlreadyRegisteredException("Email already registered");

        // Check if a user with the username is already present
        if (userRepository.findByUsername(dto.getUsername()).isPresent())
            throw new UsernameAlreadyTakenException("Username already taken");

        // Create a User
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));

        // Save User to database
        user = userRepository.save(user);

        // Create a User Profile with default avatar "tech-girl"
        // The UserProfile constructor handles initializing currentLoginStreak to 0 and lastLoginDate to null
        UserProfile profile = new UserProfile(user, "tech-girl");

        // Save User Profile to database
        userProfileRepository.save(profile);

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getId());

        // Return JWT token
        return new SignupResponseDto(token);
    }

    @Transactional // Ensure this method is transactional as it updates UserProfile
    public LoginResponseDto login(LoginRequestDto dto) {

        // Check if the email exists, and if yes, the password is correct
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(dto.getPassword(), user.getPasswordHash()))
            throw new InvalidCredentialsException("Invalid email or password");

        // --- Login Streak Logic ---
        UserProfile userProfile = user.getProfile();
        LocalDate today = LocalDate.now();

        if (userProfile.getLastLoginDate() == null) {
            // First login ever for this user
            userProfile.setCurrentLoginStreak(1);
        } else {
            LocalDate lastLogin = userProfile.getLastLoginDate();
            // If the last login was yesterday, increment streak
            if (lastLogin.equals(today.minusDays(1))) {
                userProfile.setCurrentLoginStreak(userProfile.getCurrentLoginStreak() + 1);
            }
            // If the last login was today, do nothing (streak remains same)
            else if (lastLogin.equals(today)) {
                // Do nothing, streak is already counted for today
            }
            // If the last login was more than one day ago, reset streak
            else {
                userProfile.setCurrentLoginStreak(1); // Start a new streak
            }
        }
        userProfile.setLastLoginDate(today); // Update last login date to today

        // Save the updated user profile
        userProfileRepository.save(userProfile);
        // --- End Login Streak Logic ---

        String token = jwtUtil.generateToken(user.getId());

        return new LoginResponseDto(token);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequestDto dto) {
        if (!dto.getNewPassword().equals(dto.getConfirmNewPassword()))
            throw new RuntimeException("New password and confirmation do not match");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(dto.getOldPassword(), user.getPasswordHash()))
            throw new RuntimeException("Old password is incorrect");

        user.setPasswordHash(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);
    }
}