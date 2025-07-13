package com.learningplatform.backend.features.onboarding.client;

import com.learningplatform.backend.features.onboarding.client.dto.request.FastApiRequestDto;
import com.learningplatform.backend.features.onboarding.client.dto.response.FastApiResponseDto;
import com.learningplatform.backend.features.onboarding.dto.request.OnboardingRequestDto;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class OnboardingFastApiClient {

    private static final Logger logger = LoggerFactory.getLogger(OnboardingFastApiClient.class);

    private final RestTemplate restTemplate;

    public OnboardingFastApiClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public FastApiResponseDto getPersonalizedCourses(FastApiRequestDto questionnaireMap) {
        String url = "http://localhost:8000/personalize";

        // 🪵 Log the actual request payload
        logger.info("Sending prompt to {}: {}", url, questionnaireMap);

        return restTemplate.postForObject(url, questionnaireMap, FastApiResponseDto.class);
    }
}
