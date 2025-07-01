package com.learningplatform.backend.features.onboarding.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.learningplatform.backend.features.onboarding.client.FastApiClient;
import com.learningplatform.backend.features.onboarding.dto.request.OnboardingRequestDto;
import com.learningplatform.backend.features.onboarding.dto.response.CourseResponseDto;
import com.learningplatform.backend.features.onboarding.dto.response.OnboardingResponseDto;
import com.learningplatform.backend.repository.course.resources.ResourceRepository;

@ExtendWith(MockitoExtension.class)
public class PersonalizationServiceTest {

    @Mock
    private FastApiClient fastApiClient;

    @Mock
    private ResourceRepository resourceRepository;

    @InjectMocks
    private PersonalizationService personalizationService;

    @Test
    void testGetPersonalizedCourses_enrichesWithMultipleCourses() {
        // Setup mock request
        OnboardingRequestDto requestDto = new OnboardingRequestDto();
        requestDto.setQn1("What do you like?");
        requestDto.setAns1("iOS");

        // Setup mock FastAPI response with 5 different courses
        List<CourseResponseDto> courses = List.of(
            new CourseResponseDto("ios-101", "iOS Development", "Build iOS apps"),
            new CourseResponseDto("android-101", "Android Development", "Build Android apps"),
            new CourseResponseDto("web-101", "Web Development", "Build websites"),
            new CourseResponseDto("data-101", "Data Science", "Analyze data"),
            new CourseResponseDto("ml-101", "Machine Learning", "Learn ML basics")
        );

        OnboardingResponseDto fastApiResponse = new OnboardingResponseDto();
        fastApiResponse.setIntroParagraph("Here's your roadmap!");
        fastApiResponse.setCourses(courses);

        when(fastApiClient.getPersonalizedCourses(requestDto)).thenReturn(fastApiResponse);

        // Setup mock DB responses for each course (same values for simplicity)
        for (CourseResponseDto course : courses) {
            when(resourceRepository.countByCourseIdAndType(course.getCourseId(), "DOC")).thenReturn(1L);
            when(resourceRepository.countByCourseIdAndType(course.getCourseId(), "NOTE")).thenReturn(2L);
            when(resourceRepository.countByCourseIdAndType(course.getCourseId(), "VIDEO")).thenReturn(3L);
            when(resourceRepository.sumXPByCourseId(course.getCourseId())).thenReturn(100);
        }

        // Call service method
        OnboardingResponseDto result = personalizationService.getPersonalizedCourses(requestDto);

        // Print enriched response
        System.out.println("=== Personalized Onboarding Response ===");
        System.out.println("Intro: " + result.getIntroParagraph());
        result.getCourses().forEach(c -> {
            System.out.println("Course ID: " + c.getCourseId());
            System.out.println("Name: " + c.getName());
            System.out.println("Description: " + c.getDescription());
            System.out.println("Documents: " + c.getNumDocs());
            System.out.println("Notes: " + c.getNumNotes());
            System.out.println("Videos: " + c.getNumVideos());
            System.out.println("Total XP: " + c.getTotalXP());
            System.out.println("-------------------------");
        });

        // Assert the intro paragraph is correct
        assertEquals("Here's your roadmap!", result.getIntroParagraph());

        // Assert 5 courses returned
        assertEquals(5, result.getCourses().size());

        // Assert enrichment for each course
        for (CourseResponseDto course : result.getCourses()) {
            assertEquals(1L, course.getNumDocs());
            assertEquals(2L, course.getNumNotes());
            assertEquals(3L, course.getNumVideos());
            assertEquals(100, course.getTotalXP());
        }
    }
}
