package com.learningplatform.backend.features.onboarding.service;

import com.learningplatform.backend.features.onboarding.client.FastApiClient;
import com.learningplatform.backend.features.onboarding.dto.request.OnboardingRequestDto;
import com.learningplatform.backend.features.onboarding.dto.response.OnboardingResponseDto;
import com.learningplatform.backend.features.onboarding.dto.response.CourseResponseDto;
import com.learningplatform.backend.features.onboarding.dto.response.FastApiCourseDto;
import com.learningplatform.backend.features.onboarding.dto.response.FastApiResponseDto;
import com.learningplatform.backend.repository.course.resources.ResourceRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PersonalizationService {

    private final ResourceRepository resourceRepository;
    private final FastApiClient fastApiClient;

    // Manually added constructor for dependency injection
    public PersonalizationService(ResourceRepository resourceRepository, FastApiClient fastApiClient) {
        this.resourceRepository = resourceRepository;
        this.fastApiClient = fastApiClient;
    }

    public OnboardingResponseDto getPersonalizedCourses(OnboardingRequestDto requestDto) {
        String prompt = String.format("""
            User's questionnaire responses:
            {
            "%s": ["%s"],
            "%s": ["%s"],
            "%s": ["%s"],
            "%s": ["%s"]
            }
            """,
            requestDto.getQn1(), requestDto.getAns1(),
            requestDto.getQn2(), requestDto.getAns2(),
            requestDto.getQn3(), requestDto.getAns3(),
            requestDto.getQn4(), requestDto.getAns4()
        );

        FastApiResponseDto fastApiResponse = fastApiClient.getPersonalizedCourses(prompt);

        // Convert to internal DTOs
        List<CourseResponseDto> enrichedCourses = new ArrayList<>();
        for (FastApiCourseDto fastCourse : fastApiResponse.getRecommendedCourses()) {
            String courseId = fastCourse.getId();
            CourseResponseDto enriched = new CourseResponseDto();
            enriched.setCourseId(courseId);
            enriched.setName(fastCourse.getName());
            enriched.setDescription(fastCourse.getDescription());

            // Enrich with DB data
            enriched.setNumDocs(resourceRepository.countByCourseIdAndType(courseId, "DOC"));
            enriched.setNumNotes(resourceRepository.countByCourseIdAndType(courseId, "NOTE"));
            enriched.setNumVideos(resourceRepository.countByCourseIdAndType(courseId, "VIDEO"));
            enriched.setTotalXP(resourceRepository.sumXPByCourseId(courseId));

            enrichedCourses.add(enriched);
        }

        // Build and return final onboarding response
        OnboardingResponseDto response = new OnboardingResponseDto();
        response.setIntroParagraph(fastApiResponse.getIntroParagraph());
        response.setCourses(enrichedCourses);

        return response;
    }


}
