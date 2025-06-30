// File: src/main/java/com/learningplatform/backend/service/OnboardingService.java
package com.learningplatform.backend.service;

import com.learningplatform.backend.converter.QuestionnaireResponsesConverter; // No direct import needed here, but good to know it's used
import com.learningplatform.backend.dto.request.OnboardingRequest;
import com.learningplatform.backend.dto.response.CourseRecommendationDto;
import com.learningplatform.backend.dto.response.OnboardingResponse;
import com.learningplatform.backend.dto.response.QuizQuestionDto;
import com.learningplatform.backend.dto.response.ResourceDto;
import com.learningplatform.backend.model.Course;
import com.learningplatform.backend.model.QuizQuestion;
import com.learningplatform.backend.model.Resource;
import com.learningplatform.backend.model.User;
import com.learningplatform.backend.model.UserProfile;
import com.learningplatform.backend.repository.CourseRepository;
import com.learningplatform.backend.repository.UserProfileRepository;
import com.learningplatform.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import com.fasterxml.jackson.databind.ObjectMapper; // Ensure ObjectMapper is available for converter

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OnboardingService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final CourseRepository courseRepository;
    private final RestClient restClient;
    private final ObjectMapper objectMapper; // Will be used by the converter implicitly

    private static final String FASTAPI_BASE_URL = "http://localhost:8000/api";

    public OnboardingService(UserRepository userRepository,
                             UserProfileRepository userProfileRepository,
                             CourseRepository courseRepository,
                             RestClient.Builder restClientBuilder,
                             ObjectMapper objectMapper) { // ObjectMapper is injected here
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.courseRepository = courseRepository;
        this.objectMapper = objectMapper; // Store it for potential direct use or implicitly by converters
        this.restClient = restClientBuilder.baseUrl(FASTAPI_BASE_URL).build();
    }

    @Transactional
    public OnboardingResponse processOnboarding(String userEmail, OnboardingRequest onboardingRequest) {
        // 1. Retrieve the User and their UserProfile
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found for email: " + userEmail));

        UserProfile userProfile = user.getUserProfile();
        if (userProfile == null) {
            userProfile = new UserProfile();
            user.setUserProfile(userProfile);
        }

        // 2. Save questionnaire responses to UserProfile
        // Now directly assign the Map<String, List<String>>
        userProfile.setQuestionnaireResponses(onboardingRequest.getQuestionnaireResponses());
        userProfileRepository.save(userProfile);

        // ... (rest of the code remains largely the same)

        // 3. Call FastAPI endpoint
        FastApiResponse fastApiResponse = callFastApiForRecommendations(onboardingRequest.getQuestionnaireResponses());

        // 4. Extract course IDs from FastAPI response
        List<String> courseIdsFromFastApi = fastApiResponse.getRecommendedCourses().stream()
                .map(FastApiCourseDto::getId)
                .collect(Collectors.toList());

        // 5. Query database for course details
        List<Course> coursesFromDb = courseRepository.findAllById(courseIdsFromFastApi);

        // Create a map for quick lookup of courses from DB by ID
        Map<String, Course> courseMap = coursesFromDb.stream()
                .collect(Collectors.toMap(Course::getId, course -> course));

        // 6. Combine data and prepare final response DTO
        List<CourseRecommendationDto> recommendedCourses = fastApiResponse.getRecommendedCourses().stream()
                .map(fastApiCourse -> {
                    Course dbCourse = courseMap.get(fastApiCourse.getId());
                    if (dbCourse != null) {
                        return mapToCourseRecommendationDto(fastApiCourse, dbCourse);
                    }
                    return new CourseRecommendationDto(fastApiCourse.getId(), fastApiCourse.getName(),
                            fastApiCourse.getDescription(), null, null, null, null);
                })
                .collect(Collectors.toList());

        return new OnboardingResponse(fastApiResponse.getIntroParagraph(), recommendedCourses);
    }

    private FastApiResponse callFastApiForRecommendations(Map<String, List<String>> questionnaireResponses) {
        try {
            return restClient.post()
                    .uri("/recommend")
                    .body(questionnaireResponses)
                    .retrieve()
                    .body(FastApiResponse.class);
        } catch (Exception e) {
            System.err.println("Error calling FastAPI: " + e.getMessage());
            throw new RuntimeException("Failed to get recommendations from external service.", e);
        }
    }

    private CourseRecommendationDto mapToCourseRecommendationDto(FastApiCourseDto fastApiCourse, Course dbCourse) {
        List<ResourceDto> documentationLinks = dbCourse.getDocumentationLinks().stream()
                .map(this::mapToResourceDto)
                .collect(Collectors.toList());

        List<ResourceDto> notesLinks = dbCourse.getNotesLinks().stream()
                .map(this::mapToResourceDto)
                .collect(Collectors.toList());

        List<ResourceDto> videoLinks = dbCourse.getVideoLinks().stream()
                .map(this::mapToResourceDto)
                .collect(Collectors.toList());

        List<QuizQuestionDto> quizQuestions = dbCourse.getQuizQuestions().stream()
                .map(this::mapToQuizQuestionDto)
                .collect(Collectors.toList());

        return new CourseRecommendationDto(
                fastApiCourse.getId(),
                fastApiCourse.getName(),
                fastApiCourse.getDescription(),
                documentationLinks,
                notesLinks,
                videoLinks,
                quizQuestions
        );
    }

    private ResourceDto mapToResourceDto(Resource resource) {
        return new ResourceDto(
                resource.getName(),
                resource.getDescription(),
                resource.getLink(),
                resource.isCompletionStatus()
        );
    }

    private QuizQuestionDto mapToQuizQuestionDto(QuizQuestion quizQuestion) {
        return new QuizQuestionDto(
                quizQuestion.getQnName(),
                quizQuestion.getOptionsPossible(),
                quizQuestion.getCorrectOption(),
                quizQuestion.isQnAnsweredStatus(),
                quizQuestion.getOptionPicked()
        );
    }

    private static class FastApiResponse {
        private String introParagraph;
        private List<FastApiCourseDto> recommendedCourses;

        public String getIntroParagraph() { return introParagraph; }
        public void setIntroParagraph(String introParagraph) { this.introParagraph = introParagraph; }
        public List<FastApiCourseDto> getRecommendedCourses() { return recommendedCourses; }
        public void setRecommendedCourses(List<FastApiCourseDto> recommendedCourses) { this.recommendedCourses = recommendedCourses; }
    }

    private static class FastApiCourseDto {
        private String id;
        private String name;
        private String description;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }
}