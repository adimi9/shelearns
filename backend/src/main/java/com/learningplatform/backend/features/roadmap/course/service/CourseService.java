package com.learningplatform.backend.features.roadmap.course.service;

// These are import statements. They bring in classes from other packages that this Service needs to use.
// DTOs (Data Transfer Objects) for structuring the API response.
// They are located in: com.learningplatform.backend.features.roadmap.course.dto.response
import com.learningplatform.backend.features.roadmap.course.dto.response.CourseLevelDetailsResponseDto;
import com.learningplatform.backend.features.roadmap.course.dto.response.CourseSectionsDto;
import com.learningplatform.backend.features.roadmap.course.dto.response.QuizResourceResponseDto;
// import com.learningplatform.backend.features.roadmap.course.dto.response.ResourceResponseDto; // Base DTO for all resources - NO LONGER NEEDED AFTER REMOVING HELPER
import com.learningplatform.backend.features.roadmap.course.dto.response.VideoResourceResponseDto;
import com.learningplatform.backend.features.roadmap.course.dto.response.WebResourceResponseDto;

// Entity classes (your database models)
// These are located in: com.learningplatform.backend.model.course and com.learningplatform.backend.model.course.resources
import com.learningplatform.backend.model.course.resources.Course; // Represents the 'Course' table
import com.learningplatform.backend.model.course.resources.CourseLevel; // Represents the 'Course_Level' table
import com.learningplatform.backend.model.course.resources.Resource; // Base class for all resource types, maps to 'Resource' table
import com.learningplatform.backend.model.course.resources.QuizResource; // Extends Resource, maps to 'quiz_resource' table
import com.learningplatform.backend.model.course.resources.VideoResource; // Extends Resource, maps to 'Video_Resource' table
import com.learningplatform.backend.model.course.resources.WebResource; // Extends Resource, maps to 'Web_Resource' table

// Progress Entities
import com.learningplatform.backend.model.course.progress.UserLinkedResourceProgress;
import com.learningplatform.backend.model.course.progress.UserQuizQuestionProgress;

// User Entity
import com.learningplatform.backend.model.user.User;

// Enum for resource types, used to distinguish different kinds of learning materials
import com.learningplatform.backend.model.course.resources.enums.ResourceType;
import com.learningplatform.backend.model.course.resources.enums.LevelName; // Ensure LevelName is imported if used in DTO

// Spring framework annotations and utilities
import com.learningplatform.backend.repository.course.resources.CourseLevelRepository; // Repository for CourseLevel entity
import com.learningplatform.backend.repository.course.progress.UserLinkedResourceProgressRepository;
import com.learningplatform.backend.repository.course.progress.UserQuizQuestionProgressRepository;
import com.learningplatform.backend.repository.user.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Standard Java utility classes
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CourseService {

    private static final Logger logger = LoggerFactory.getLogger(CourseService.class);

    private final CourseLevelRepository courseLevelRepository;
    private final UserLinkedResourceProgressRepository userLinkedResourceProgressRepository;
    private final UserQuizQuestionProgressRepository userQuizQuestionProgressRepository;
    private final UserRepository userRepository;

    public CourseService(CourseLevelRepository courseLevelRepository,
                         UserLinkedResourceProgressRepository userLinkedResourceProgressRepository,
                         UserQuizQuestionProgressRepository userQuizQuestionProgressRepository,
                         UserRepository userRepository) {
        this.courseLevelRepository = courseLevelRepository;
        this.userLinkedResourceProgressRepository = userLinkedResourceProgressRepository;
        this.userQuizQuestionProgressRepository = userQuizQuestionProgressRepository;
        this.userRepository = userRepository;
        logger.info("CourseService initialized.");
    }

    @Transactional(readOnly = true)
    public Optional<CourseLevelDetailsResponseDto> getCourseLevelDetails(Long courseLevelId, Long userId) {
        logger.info("Attempting to fetch details for CourseLevel ID: {} for user ID: {}", courseLevelId, userId);

        Optional<CourseLevel> courseLevelOptional = courseLevelRepository.findById(courseLevelId);
        if (courseLevelOptional.isEmpty()) {
            logger.warn("CourseLevel with ID {} not found.", courseLevelId);
            return Optional.empty();
        }
        CourseLevel courseLevel = courseLevelOptional.get();

        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            logger.warn("User with ID {} not found. Cannot retrieve user-specific progress.", userId);
            // Decide how to handle this: throw exception or return details without progress.
            // For now, we'll proceed and progress maps will be empty.
        }
        User user = userOptional.orElse(null);

        Course course = courseLevel.getCourse();
        logger.debug("Found CourseLevel: ID={}, Name={}, Course Name={}",
                courseLevel.getLevelId(), courseLevel.getLevelName(), course.getCourseName());

        List<Resource> allResourcesInLevel = new ArrayList<>(courseLevel.getResources());
        allResourcesInLevel.sort((r1, r2) -> Integer.compare(r1.getResourceOrder(), r2.getResourceOrder()));
        logger.debug("Found {} resources for CourseLevel ID: {}", allResourcesInLevel.size(), courseLevelId);

        // --- Fetch User Progress Data ---
        Map<Long, UserLinkedResourceProgress> linkedProgressMap = Map.of();
        Map<Long, UserQuizQuestionProgress> quizProgressMap = Map.of();
        Integer totalQuizScore = 0; // <--- INITIALIZE TOTAL QUIZ SCORE

        if (user != null) {
            Set<Long> allResourceIds = allResourcesInLevel.stream()
                    .map(Resource::getResourceId)
                    .collect(Collectors.toSet());

            linkedProgressMap = userLinkedResourceProgressRepository
                    .findByUser_IdAndResource_ResourceIdIn(userId, allResourceIds)
                    .stream()
                    .collect(Collectors.toMap(ulrp -> ulrp.getResource().getResourceId(), ulrp -> ulrp));
            logger.debug("Fetched {} UserLinkedResourceProgress entries for user {}", linkedProgressMap.size(), userId);

            Set<Long> quizResourceIds = allResourcesInLevel.stream()
                    .filter(r -> r.getResourceType() == ResourceType.QUIZ && r instanceof QuizResource)
                    .map(Resource::getResourceId)
                    .collect(Collectors.toSet());

            quizProgressMap = userQuizQuestionProgressRepository
                    .findByUser_IdAndQuestionResource_ResourceIdIn(userId, quizResourceIds)
                    .stream()
                    .collect(Collectors.toMap(uqqp -> uqqp.getQuestionResource().getResourceId(), uqqp -> uqqp));
            logger.debug("Fetched {} UserQuizQuestionProgress entries for user {}", quizProgressMap.size(), userId);
        }

        List<WebResourceResponseDto> docs = new ArrayList<>();
        List<WebResourceResponseDto> notes = new ArrayList<>();
        List<VideoResourceResponseDto> videos = new ArrayList<>();
        List<QuizResourceResponseDto> quizzes = new ArrayList<>();

        for (Resource resource : allResourcesInLevel) {
            // This 'isCompleted' variable is specifically for generic resources (DOC, NOTE, VIDEO)
            boolean isGenericResourceCompleted = linkedProgressMap.containsKey(resource.getResourceId())
                                             && linkedProgressMap.get(resource.getResourceId()).isCompletionStatus();

            switch (resource.getResourceType()) {
                case DOC:
                    if (resource instanceof WebResource docResource) {
                        docs.add(new WebResourceResponseDto(
                            docResource.getResourceId(),
                            docResource.getName(),
                            docResource.getDescription(),
                            docResource.getLink(),
                            docResource.getResourceType(),
                            docResource.getResourceXp(),
                            docResource.getResourceOrder(),
                            isGenericResourceCompleted // Correctly use for generic resources
                        ));
                    }
                    break;
                case NOTE:
                    if (resource instanceof WebResource noteResource) {
                        notes.add(new WebResourceResponseDto(
                            noteResource.getResourceId(),
                            noteResource.getName(),
                            noteResource.getDescription(),
                            noteResource.getLink(),
                            noteResource.getResourceType(),
                            noteResource.getResourceXp(),
                            noteResource.getResourceOrder(),
                            isGenericResourceCompleted // Correctly use for generic resources
                        ));
                    }
                    break;
                case VIDEO:
                    if (resource instanceof VideoResource videoResource) {
                        videos.add(new VideoResourceResponseDto(
                            videoResource.getResourceId(),
                            videoResource.getName(),
                            videoResource.getDuration(),
                            videoResource.getLink(),
                            videoResource.getResourceType(),
                            videoResource.getResourceXp(),
                            videoResource.getResourceOrder(),
                            isGenericResourceCompleted // Correctly use for generic resources
                        ));
                    }
                    break;
                case QUIZ:
                    if (resource instanceof QuizResource quizResource) {
                        UserQuizQuestionProgress quizProgress = quizProgressMap.get(quizResource.getResourceId());

                        // Default values for quiz progress
                        String userAnsweredOption = null;
                        boolean isCorrectlyAnswered = false;
                        Integer scoreAwarded = 0;
                        boolean quizCompleted = false; // Initialize to false for quiz-specific completion

                        if (quizProgress != null) {
                            userAnsweredOption = quizProgress.getSelectedOption();
                            isCorrectlyAnswered = quizProgress.isCorrect();
                            scoreAwarded = Optional.ofNullable(quizProgress.getScore()).orElse(0);
                            quizCompleted = quizProgress.isCompleted(); // <-- GET THE ACTUAL QUIZ COMPLETION STATUS HERE

                            // Accumulate total quiz score only if the question was answered correctly
                            // The service (processQuizSubmission) already handles individual question scoring.
                            // Here we just sum up the scores stored in UserQuizQuestionProgress.
                            totalQuizScore += scoreAwarded; 
                        }

                        quizzes.add(new QuizResourceResponseDto(
                            quizResource.getResourceId(),
                            quizResource.getQuestion(),
                            quizResource.getOption1(),
                            quizResource.getOption2(),
                            quizResource.getOption3(),
                            quizResource.getOption4(),
                            quizResource.getCorrectOption(),
                            quizResource.getHint(),
                            quizResource.getResourceType(),
                            quizResource.getResourceXp(),
                            quizResource.getResourceOrder(),
                            quizCompleted, // <-- USE THE CORRECT quizCompleted VARIABLE HERE
                            userAnsweredOption,
                            isCorrectlyAnswered,
                            scoreAwarded
                        ));
                    }
                    break;
                default:
                    logger.warn("Unknown resource type encountered: {}", resource.getResourceType());
                    break;
            }
        }

        CourseSectionsDto sectionsDto = new CourseSectionsDto(docs, notes, videos, quizzes);

        logger.info("Successfully mapped resources into CourseSectionsDto for CourseLevel ID: {}.", courseLevelId);

        // Create the final CourseLevelDetailsResponseDto with the totalQuizScore
        CourseLevelDetailsResponseDto responseDto = new CourseLevelDetailsResponseDto(
                courseLevel.getLevelId(), // Maps to 'id'
                course.getCourseName(),   // Maps to 'title'
                courseLevel.getLevelName(),
                sectionsDto,
                totalQuizScore // <--- PASS TOTAL QUIZ SCORE
        );

        logger.info("Successfully retrieved and mapped details for CourseLevel ID: {}", courseLevelId);
        return Optional.of(responseDto);
    }

    // The mapResourceToDto helper method is no longer used and can be removed entirely.
    // If you need similar logic elsewhere, consider refactoring it with proper parameters
    // for completion status and quiz progress.
}