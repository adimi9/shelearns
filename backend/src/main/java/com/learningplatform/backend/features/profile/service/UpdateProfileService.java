package com.learningplatform.backend.features.profile.service;

import com.learningplatform.backend.features.profile.dto.request.UpdateAvatarRequestDto;
import com.learningplatform.backend.model.user.profile.UserProfile;
import com.learningplatform.backend.repository.user.UserRepository;
import com.learningplatform.backend.repository.user.profile.UserProfileRepository;
import com.learningplatform.backend.features.auth.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
public class UpdateProfileService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    private final Set<String> validAvatars = Set.of(
            "tech-girl", "code-ninja", "design-wizard",
            "data-explorer", "creative-coder", "future-dev"
    );

    public UpdateProfileService(UserRepository userRepository,
                                UserProfileRepository userProfileRepository,
                                PasswordEncoder passwordEncoder,
                                JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public void updateAvatar(Long userId, UpdateAvatarRequestDto dto) {
        if (!validAvatars.contains(dto.getAvatarType()))
            throw new RuntimeException("Invalid avatar type");

        UserProfile profile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User profile not found"));

        profile.setAvatarType(dto.getAvatarType());
        userProfileRepository.save(profile);
    }
}
