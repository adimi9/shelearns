package com.learningplatform.backend.features.profile.controller;

import com.learningplatform.backend.features.profile.dto.request.UpdateAvatarRequestDto;
import com.learningplatform.backend.features.profile.service.UpdateProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping()
public class UpdateProfileController {

    private final UpdateProfileService updateProfileService;

    public UpdateProfileController(UpdateProfileService updateProfileService) {
        this.updateProfileService = updateProfileService;
    }

    @PostMapping("/update-avatar")
    public ResponseEntity<?> updateAvatar(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody UpdateAvatarRequestDto dto) {

        updateProfileService.updateAvatar(userId, dto);
        return ResponseEntity.ok().build();
    }
}
