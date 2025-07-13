/*
package com.learningplatform.backend.features.profile.service;

import com.learningplatform.backend.features.profile.update.dto.request.UpdateAvatarRequestDto;
import com.learningplatform.backend.features.profile.update.service.UpdateProfileService;
import com.learningplatform.backend.model.user.profile.UserProfile;
import com.learningplatform.backend.repository.user.profile.UserProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UpdateProfileServiceTest {

    @Mock
    UserProfileRepository userProfileRepository;

    @InjectMocks
    UpdateProfileService updateProfileService;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void updateAvatar_shouldThrowForInvalidAvatar() {
        UpdateAvatarRequestDto dto = new UpdateAvatarRequestDto("invalid-avatar");

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> updateProfileService.updateAvatar(1L, dto));

        assertEquals("Invalid avatar type", ex.getMessage());
    }

    @Test
    void updateAvatar_shouldSaveValidAvatar() {
        UserProfile profile = UserProfile.builder().avatarType("tech-girl").build();
        when(userProfileRepository.findById(1L)).thenReturn(Optional.of(profile));

        UpdateAvatarRequestDto dto = new UpdateAvatarRequestDto("code-ninja");
        updateProfileService.updateAvatar(1L, dto);

        verify(userProfileRepository).save(profile);
        assertEquals("code-ninja", profile.getAvatarType());
    }
}
*/