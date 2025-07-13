package com.learningplatform.backend.features.dashboard.client;

import com.learningplatform.backend.features.dashboard.client.dto.request.AnalysisRequestDto;
import com.learningplatform.backend.features.dashboard.client.dto.response.AnalysisResponseDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class FastApiClient {

    private static final Logger logger = LoggerFactory.getLogger(FastApiClient.class);

    private final RestTemplate restTemplate;

    @Value("${fastapi.analysis.url}")
    private String fastapiAnalysisUrl;

    public FastApiClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public AnalysisResponseDto analyzeProgress(AnalysisRequestDto analysisRequestDto) {
        logger.info("Sending progress analysis request to {}: {}", fastapiAnalysisUrl, analysisRequestDto);

        try {
            return restTemplate.postForObject(fastapiAnalysisUrl, analysisRequestDto, AnalysisResponseDto.class);
        } catch (Exception e) {
            logger.error("Error calling FastAPI /analyze-progress/ endpoint: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get progress analysis from AI service.", e);
        }
    }
}