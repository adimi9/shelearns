package com.learningplatform.backend.features.onboarding.client;

import com.learningplatform.backend.features.onboarding.dto.request.OnboardingRequestDto;
import com.learningplatform.backend.features.onboarding.dto.response.FastApiResponseDto;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class FastApiClient {

    private static final Logger logger = LoggerFactory.getLogger(FastApiClient.class);

    private final RestTemplate restTemplate;

    public FastApiClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public FastApiResponseDto getPersonalizedCourses(String prompt) {
        String url = "http://localhost:8000/personalize";

        Map<String, String> body = new HashMap<>();
        body.put("prompt", prompt);

        // 🪵 Log the actual request payload
        logger.info("Sending prompt to {}: {}", url, prompt);

        return restTemplate.postForObject(url, body, FastApiResponseDto.class);
    }
}
