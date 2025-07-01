package com.learningplatform.backend.features.auth.service;

import com.learningplatform.backend.features.auth.dto.request.*;
import com.learningplatform.backend.features.auth.dto.response.LoginResponseDto;
import com.learningplatform.backend.features.auth.util.JwtUtil;
import com.learningplatform.backend.model.user.User;
import com.learningplatform.backend.model.user.profile.UserProfile;
import com.learningplatform.backend.repository.user.UserRepository;
import com.learningplatform.backend.repository.user.profile.UserProfileRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

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
    public void signup(SignupRequestDto dto) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent())
            throw new RuntimeException("Email already registered");

        if (userRepository.findByUsername(dto.getUsername()).isPresent())
            throw new RuntimeException("Username already taken");

        User user = User.builder()
                .username(dto.getUsername())
                .email(dto.getEmail())
                .passwordHash(passwordEncoder.encode(dto.getPassword()))
                .build();

        user = userRepository.save(user);

        // Create empty profile with default avatar
        UserProfile profile = UserProfile.builder()
                .user(user)
                .avatarType("tech-girl") // default avatar
                .build();

        userProfileRepository.save(profile);
    }

    public LoginResponseDto login(LoginRequestDto dto) {
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(dto.getPassword(), user.getPasswordHash()))
            throw new RuntimeException("Invalid email or password");

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
