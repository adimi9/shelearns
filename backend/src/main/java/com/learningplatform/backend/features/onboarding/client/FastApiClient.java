package com.learningplatform.backend.features.onboarding.client;

import com.learningplatform.backend.features.onboarding.dto.request.OnboardingRequestDto;
import com.learningplatform.backend.features.onboarding.dto.response.OnboardingResponseDto;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class FastApiClient {

    private final RestTemplate restTemplate;

    public FastApiClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public OnboardingResponseDto getPersonalizedCourses(OnboardingRequestDto requestDto) {
        String url = "http://localhost:8000/personalize"; // or your FastAPI endpoint
        return restTemplate.postForObject(url, requestDto, OnboardingResponseDto.class);
    }
}
