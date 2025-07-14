package com.learningplatform.backend.features.onboarding.client;

import com.learningplatform.backend.features.onboarding.client.dto.request.FastApiRequestDto;
import com.learningplatform.backend.features.onboarding.client.dto.response.FastApiResponseDto;
import com.learningplatform.backend.features.onboarding.dto.request.OnboardingRequestDto;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class OnboardingFastApiClient {

    private static final Logger logger = LoggerFactory.getLogger(OnboardingFastApiClient.class);

    private final RestTemplate restTemplate;
    private final String fastApiUrl;

    public OnboardingFastApiClient(
        RestTemplate restTemplate,
        @Value("${fastapi.personalization.url}") String fastApiUrl
    ) {
        this.restTemplate = restTemplate;
        this.fastApiUrl = fastApiUrl;
    }

    public FastApiResponseDto getPersonalizedCourses(FastApiRequestDto questionnaireMap) {
        logger.info("Sending prompt to {}: {}", fastApiUrl, questionnaireMap);
        return restTemplate.postForObject(fastApiUrl, questionnaireMap, FastApiResponseDto.class);
    }
}

