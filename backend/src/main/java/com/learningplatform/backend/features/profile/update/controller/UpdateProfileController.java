package com.learningplatform.backend.features.profile.update.controller;

import com.learningplatform.backend.features.profile.update.dto.request.UpdateAvatarRequestDto;
import com.learningplatform.backend.features.profile.update.dto.request.UpdateProfileInfoRequestDto;
import com.learningplatform.backend.features.profile.update.service.UpdateProfileService;

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

    @PatchMapping("/update-profile-info")
    public ResponseEntity<?> updateProfileInfo(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody UpdateProfileInfoRequestDto dto) {

        updateProfileService.updateProfileInfo(userId, dto);
        return ResponseEntity.ok().build();
}

}
