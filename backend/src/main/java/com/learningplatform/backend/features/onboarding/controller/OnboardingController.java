package com.learningplatform.backend.features.onboarding.controller;

import com.learningplatform.backend.features.onboarding.dto.request.OnboardingRequestDto;
import com.learningplatform.backend.features.onboarding.dto.response.OnboardingResponseDto;
import com.learningplatform.backend.features.onboarding.service.PersonalizationService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/onboarding")
public class OnboardingController {

    private final PersonalizationService personalizationService;

    // Constructor for dependency injection
    public OnboardingController(PersonalizationService personalizationService) {
        this.personalizationService = personalizationService;
    }

    @PostMapping
    public OnboardingResponseDto personalize(@RequestBody OnboardingRequestDto requestDto) {
        return personalizationService.getPersonalizedCourses(requestDto);
    }
}
