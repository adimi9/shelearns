package com.learningplatform.backend.features.onboarding.service;

import com.learningplatform.backend.features.onboarding.client.OnboardingFastApiClient;
import com.learningplatform.backend.features.onboarding.client.dto.request.FastApiRequestDto;
import com.learningplatform.backend.features.onboarding.client.dto.response.FastApiCourseDto;
import com.learningplatform.backend.features.onboarding.client.dto.response.FastApiResponseDto;
import com.learningplatform.backend.features.onboarding.dto.request.OnboardingRequestDto;
import com.learningplatform.backend.model.course.resources.Course;
import com.learningplatform.backend.model.course.resources.CourseLevel;
import com.learningplatform.backend.model.course.resources.Resource;
import com.learningplatform.backend.model.course.resources.QuizResource;
import com.learningplatform.backend.repository.course.resources.CourseRepository;
import com.learningplatform.backend.repository.course.roadmap.UserRoadmapRepository;
import com.learningplatform.backend.repository.user.UserRepository;
import com.learningplatform.backend.repository.course.progress.UserLinkedResourceProgressRepository;
import com.learningplatform.backend.repository.course.progress.UserQuizQuestionProgressRepository;

import com.learningplatform.backend.model.user.onboarding.UserOnboardingData;
import com.learningplatform.backend.repository.user.onboarding.UserOnboardingDataRepository;

import jakarta.transaction.Transactional;

import com.learningplatform.backend.model.course.resources.enums.LevelName;
import com.learningplatform.backend.model.course.roadmap.UserRoadmap;
import com.learningplatform.backend.model.course.roadmap.UserRoadmapCourse;
import com.learningplatform.backend.model.user.User;
import com.learningplatform.backend.model.course.progress.UserLinkedResourceProgress;
import com.learningplatform.backend.model.course.progress.UserQuizQuestionProgress;

// Import new exceptions
import com.learningplatform.backend.features.onboarding.exception.UserNotFoundException;
import com.learningplatform.backend.features.onboarding.exception.FastApiCommunicationException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException; // For catching issues with FastApiClient

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class PersonalizationService {

    private static final Logger logger = LoggerFactory.getLogger(PersonalizationService.class);

    private final OnboardingFastApiClient fastApiClient;
    private final CourseRepository courseRepository;
    private final UserRoadmapRepository userRoadmapRepository;
    private final UserRepository userRepository;
    private final UserLinkedResourceProgressRepository userLinkedResourceProgressRepository;
    private final UserQuizQuestionProgressRepository userQuizQuestionProgressRepository;
    private final UserOnboardingDataRepository userOnboardingDataRepository;

    public PersonalizationService(OnboardingFastApiClient fastApiClient,
                                  CourseRepository courseRepository,
                                  UserRoadmapRepository userRoadmapRepository,
                                  UserRepository userRepository,
                                  UserLinkedResourceProgressRepository userLinkedResourceProgressRepository,
                                  UserQuizQuestionProgressRepository userQuizQuestionProgressRepository,
                                  UserOnboardingDataRepository userOnboardingDataRepository) {
        this.fastApiClient = fastApiClient;
        this.courseRepository = courseRepository;
        this.userRoadmapRepository = userRoadmapRepository;
        this.userRepository = userRepository;
        this.userLinkedResourceProgressRepository = userLinkedResourceProgressRepository;
        this.userQuizQuestionProgressRepository = userQuizQuestionProgressRepository;
        this.userOnboardingDataRepository = userOnboardingDataRepository;
        logger.info("PersonalizationService initialised with all required repositories and client.");
    }

    /**
     * Generates a personalized learning roadmap for a user based on their onboarding
     * questionnaire and saves it to the database.
     * If a roadmap already exists for the user, it updates the existing one.
     * Also initializes progress for all resources and quiz questions within the recommended courses.
     *
     * @param userId The ID of the user.
     * @param requestDto The onboarding questionnaire data.
     * @return A success message indicating the roadmap was saved.
     */
    @Transactional // Ensures the entire operation is atomic
    public String generateAndSavePersonalizedRoadmap(Long userId, OnboardingRequestDto requestDto) {

        logger.info("Starting generateAndSavePersonalizedRoadmap for user ID: {}", userId);

        // Retrieve the User entity early, as it's needed for linking progress
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found for ID: " + userId)); // Use custom exception
        logger.debug("Retrieved User entity for ID: {}", userId);

        UserOnboardingData onboardingData = new UserOnboardingData(
                    user,
                    requestDto.getQn1(),
                    requestDto.getAns1(),
                    requestDto.getQn2(),
                    requestDto.getAns2(),
                    requestDto.getQn3(),
                    requestDto.getAns3(),
                    requestDto.getQn4(),
                    requestDto.getAns4()
                );
                logger.debug("Created new UserOnboardingData for user ID: {}", userId);

                userOnboardingDataRepository.save(onboardingData);

        // 1. Prepare request for FastAPI
        Map<String, Object> questionnaireMap = new HashMap<>();
        questionnaireMap.put(requestDto.getQn1(), requestDto.getAns1());
        questionnaireMap.put(requestDto.getQn2(), requestDto.getAns2());
        questionnaireMap.put(requestDto.getQn3(), requestDto.getAns3());
        questionnaireMap.put(requestDto.getQn4(), requestDto.getAns4());
        FastApiRequestDto fastApiRequest = new FastApiRequestDto(questionnaireMap);

        logger.info("Sending request to FastApi for user {}: {}", userId, fastApiRequest.toString());

        // 2. Call FastAPI for recommendations with error handling
        FastApiResponseDto fastApiResponse;
        try {
            fastApiResponse = fastApiClient.getPersonalizedCourses(fastApiRequest);
        } catch (RestClientException e) {
            logger.error("Failed to communicate with FastAPI: {}", e.getMessage(), e);
            throw new FastApiCommunicationException("Failed to get personalized courses from AI service. Please try again later.", e);
        }

        logger.info("Received response from FastApi. Intro Paragraph: '{}', Recommended Courses count: {}",
                fastApiResponse.getIntroParagraph(), fastApiResponse.getRecommendedCourses().size());

        logger.debug("Attempting to create/update user roadmap for user ID: {}.", userId);

        // 3. Retrieve or create UserRoadmap entity
        UserRoadmap userRoadmap;
        Optional<UserRoadmap> existingRoadmap = userRoadmapRepository.findByUserId(userId);

        if (existingRoadmap.isPresent()) {
            userRoadmap = existingRoadmap.get();
            logger.debug("Found existing UserRoadmap for user ID: {}. Clearing existing courses for update.", userId);
            userRoadmap.getRecommendedCourses().clear();
        } else {
            userRoadmap = new UserRoadmap();
            userRoadmap.setUserId(userId);
            userRoadmap.setUser(user);
            logger.debug("Created new UserRoadmap for user ID: {}.", userId);
        }

        userRoadmap.setIntroParagraph(fastApiResponse.getIntroParagraph());

        // 4. Process recommended courses from FastAPI and add to roadmap & initialize progress
        List<UserRoadmapCourse> managedRoadmapCourses = userRoadmap.getRecommendedCourses();
        int courseOrderCounter = 0;

        for (FastApiCourseDto fastCourse : fastApiResponse.getRecommendedCourses()) {
            String courseIdFromFastApi = fastCourse.getId();
            logger.debug("Processing FastApi recommended course ID: {}", courseIdFromFastApi);

            Optional<Course> courseOptional = courseRepository.findById(courseIdFromFastApi);

            if (courseOptional.isEmpty()) {
                logger.warn("Course with ID {} from FastAPI not found in database. Skipping for roadmap and progress initialization.", courseIdFromFastApi);
                continue;
            }

            Course course = courseOptional.get();

            Optional<CourseLevel> intermediateLevelOptional = course.getLevels().stream()
                    .filter(level -> LevelName.INTERMEDIATE.equals(level.getLevelName()))
                    .findFirst();

            if (intermediateLevelOptional.isPresent()) {
                CourseLevel intermediateLevel = intermediateLevelOptional.get();

                UserRoadmapCourse userRoadmapCourse = new UserRoadmapCourse();
                userRoadmapCourse.setLevelName(LevelName.INTERMEDIATE);
                userRoadmapCourse.setCourseLevelId(intermediateLevel.getLevelId());
                userRoadmapCourse.setCourseOrder(courseOrderCounter++);
                userRoadmapCourse.setCourseDescription(fastCourse.getDescription());
                userRoadmapCourse.setUserRoadmap(userRoadmap);

                managedRoadmapCourses.add(userRoadmapCourse);
                logger.debug("Added course '{}' (ID: {}) to roadmap with intermediate level ID: {}",
                        course.getCourseName(), courseIdFromFastApi, intermediateLevel.getLevelId());

                // --- Initialize Progress for Resources within this Course ---
                logger.debug("Initializing progress for resources in course '{}' (ID: {})", course.getCourseName(), courseIdFromFastApi);
                if (intermediateLevel.getResources() != null) {
                    for (Resource resource : intermediateLevel.getResources()) {
                        if (userLinkedResourceProgressRepository.findByUserAndResource(user, resource).isEmpty()) {
                            UserLinkedResourceProgress resourceProgress = new UserLinkedResourceProgress();
                            resourceProgress.setUser(user);
                            resourceProgress.setResource(resource);
                            resourceProgress.setCompletionStatus(false);
                            userLinkedResourceProgressRepository.save(resourceProgress);
                            logger.trace("Initialized UserLinkedResourceProgress for user {} and resource {}.", user.getId(), resource.getResourceId());
                        } else {
                            logger.trace("UserLinkedResourceProgress already exists for user {} and resource {}. Skipping initialization.", user.getId(), resource.getResourceId());
                        }

                        if (resource instanceof QuizResource) {
                            QuizResource quizResource = (QuizResource) resource;
                            if (userQuizQuestionProgressRepository.findByUserAndQuestionResource(user, quizResource).isEmpty()) {
                                UserQuizQuestionProgress quizQuestionProgress = new UserQuizQuestionProgress(user, quizResource);
                                quizQuestionProgress.setCompleted(false);
                                userQuizQuestionProgressRepository.save(quizQuestionProgress);
                                logger.trace("Initialized UserQuizQuestionProgress for user {} and quiz resource {}.", user.getId(), quizResource.getResourceId());
                            } else {
                                logger.trace("UserQuizQuestionProgress already exists for user {} and quiz resource {}. Skipping initialization.", user.getId(), quizResource.getResourceId());
                            }
                        }
                    }
                } else {
                    logger.debug("No resources found for intermediate level of course '{}' (ID: {}). No progress to initialize.", course.getCourseName(), courseIdFromFastApi);
                }

            } else {
                logger.warn("Intermediate level not found for course with ID: {}. Skipping course for roadmap.", courseIdFromFastApi);
            }
        }

        userRoadmapRepository.save(userRoadmap);
        logger.info("Roadmap created/updated and saved for user ID: {}", userId);

        return "Personalized roadmap generated and saved successfully for user ID: " + userId;
    }
}