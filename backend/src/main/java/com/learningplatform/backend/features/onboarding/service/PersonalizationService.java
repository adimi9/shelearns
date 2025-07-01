package com.learningplatform.backend.features.onboarding.service;

import com.learningplatform.backend.features.onboarding.client.FastApiClient;
import com.learningplatform.backend.features.onboarding.dto.request.OnboardingRequestDto;
import com.learningplatform.backend.features.onboarding.dto.response.OnboardingResponseDto;
import com.learningplatform.backend.features.onboarding.dto.response.CourseResponseDto;
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
    OnboardingResponseDto responseDto = fastApiClient.getPersonalizedCourses(requestDto);

    responseDto.getCourses().forEach(course -> {
        Long docs = resourceRepository.countByCourseIdAndType(course.getCourseId(), "DOC");
        Long notes = resourceRepository.countByCourseIdAndType(course.getCourseId(), "NOTE");
        Long videos = resourceRepository.countByCourseIdAndType(course.getCourseId(), "VIDEO");
        Integer xp = resourceRepository.sumXPByCourseId(course.getCourseId());

        course.setNumDocs(docs);
        course.setNumNotes(notes);
        course.setNumVideos(videos);
        course.setTotalXP(xp);
    });

    return responseDto;
}
}
