package com.learningplatform.backend.features.roadmap.overall.service;

import com.learningplatform.backend.features.roadmap.overall.dto.response.CourseLevelResponseDto;
import com.learningplatform.backend.features.roadmap.overall.dto.response.RoadmapResponseDto;
import com.learningplatform.backend.model.course.roadmap.UserRoadmap;
import com.learningplatform.backend.model.course.roadmap.UserRoadmapCourse;
import com.learningplatform.backend.model.course.progress.UserLinkedResourceProgress;
import com.learningplatform.backend.model.course.progress.UserQuizQuestionProgress;
import com.learningplatform.backend.model.course.resources.Course;
import com.learningplatform.backend.model.course.resources.CourseLevel;
import com.learningplatform.backend.model.course.resources.Resource;
import com.learningplatform.backend.model.course.resources.QuizResource;
import com.learningplatform.backend.model.course.resources.enums.LevelName;
import com.learningplatform.backend.model.course.resources.enums.ResourceType;
import com.learningplatform.backend.model.user.onboarding.UserOnboardingData;
import com.learningplatform.backend.repository.course.resources.CourseLevelRepository;
import com.learningplatform.backend.repository.course.resources.CourseRepository;
import com.learningplatform.backend.repository.course.roadmap.UserRoadmapRepository;
import com.learningplatform.backend.repository.course.progress.UserLinkedResourceProgressRepository;
import com.learningplatform.backend.repository.course.progress.UserQuizQuestionProgressRepository;
import com.learningplatform.backend.repository.user.onboarding.UserOnboardingDataRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Service class responsible for handling user roadmap logic.
 * It retrieves personalized learning roadmaps for users,
 * enriches them with detailed course and resource information,
 * and prepares the data for API responses.
 */
@Service
public class RoadmapService {

    // Logger for capturing service operations and debugging information.
    private static final Logger logger = LoggerFactory.getLogger(RoadmapService.class);

    // Repositories injected to interact with the database.
    private final UserRoadmapRepository userRoadmapRepository;
    private final CourseRepository courseRepository;
    private final CourseLevelRepository courseLevelRepository;
    private final UserLinkedResourceProgressRepository userLinkedResourceProgressRepository;
    private final UserQuizQuestionProgressRepository userQuizQuestionProgressRepository;
    private final UserOnboardingDataRepository userOnboardingDataRepository;

    /**
     * Constructor for dependency injection. Spring automatically provides
     * the required repository instances.
     */
    public RoadmapService(UserRoadmapRepository userRoadmapRepository,
                          CourseRepository courseRepository,
                          CourseLevelRepository courseLevelRepository,
                          UserLinkedResourceProgressRepository userLinkedResourceProgressRepository,
                          UserQuizQuestionProgressRepository userQuizQuestionProgressRepository,
                          UserOnboardingDataRepository userOnboardingDataRepository) {
        this.userRoadmapRepository = userRoadmapRepository;
        this.courseRepository = courseRepository;
        this.courseLevelRepository = courseLevelRepository;
        this.userLinkedResourceProgressRepository = userLinkedResourceProgressRepository;
        this.userQuizQuestionProgressRepository = userQuizQuestionProgressRepository;
        this.userOnboardingDataRepository = userOnboardingDataRepository;
        logger.info("RoadmapService initialized.");
    }

    /**
     * Retrieves a personalized learning roadmap for a given user.
     * This method is transactional and read-only for data consistency and performance.
     *
     * @param userId The ID of the user whose roadmap is to be fetched.
     * @return A RoadmapResponseDto containing the user's roadmap details.
     */
    @Transactional(readOnly = true) // Ensures the entire method runs within a read-only database transaction.
    public RoadmapResponseDto getUserRoadmap(Long userId) {
        logger.info("Fetching roadmap for user ID: {}", userId);

        Optional<UserRoadmap> userRoadmapOptional = userRoadmapRepository.findByUserId(userId);
        Optional<UserOnboardingData> userOnboardingDataOptional = userOnboardingDataRepository.findByUserId(userId);

        RoadmapResponseDto response = new RoadmapResponseDto();

        // Set category based on onboarding data
        if (userOnboardingDataOptional.isPresent()) {
            response.setCategory(userOnboardingDataOptional.get().getAns1());
            logger.debug("Found onboarding data for user {}. Category (ans1): {}", userId, userOnboardingDataOptional.get().getAns1());
        } else {
            response.setCategory("General Learning Path"); // Default category if no onboarding data
            logger.warn("No onboarding data found for user ID: {}. Setting default category.", userId);
        }

        if (userRoadmapOptional.isEmpty()) {
            logger.warn("No roadmap found for user ID: {}. Returning empty response.", userId);
            response.setIntroParagraph("No personalized roadmap found. Please complete the onboarding questionnaire.");
            response.setCourses(new ArrayList<>());
            return response;
        }

        UserRoadmap userRoadmap = userRoadmapOptional.get();
        logger.debug("Found roadmap for user ID: {}. Intro Paragraph: '{}', Courses count: {}",
                userId, userRoadmap.getIntroParagraph(), userRoadmap.getRecommendedCourses().size());

        List<CourseLevelResponseDto> enrichedCourses = new ArrayList<>();
        int coursesProcessed = 0;
        int coursesSkipped = 0;

        List<UserRoadmapCourse> sortedRoadmapCourses = userRoadmap.getRecommendedCourses().stream()
                .sorted(Comparator.comparingInt(UserRoadmapCourse::getCourseOrder))
                .collect(Collectors.toList());

        for (UserRoadmapCourse roadmapCourse : sortedRoadmapCourses) {
            Long courseLevelId = roadmapCourse.getCourseLevelId();
            LevelName levelName = roadmapCourse.getLevelName();

            logger.debug("Processing roadmap course with CourseLevel ID: {} (Level: {}).", courseLevelId, levelName);

            CourseLevelResponseDto enriched = new CourseLevelResponseDto();
            enriched.setCourseLevelId(courseLevelId);
            enriched.setLevelName(levelName);
            enriched.setDescription(roadmapCourse.getCourseDescription());

            Optional<CourseLevel> courseLevelOptional = courseLevelRepository.findById(courseLevelId);

            if (courseLevelOptional.isEmpty()) {
                logger.warn("CourseLevel with ID {} not found in database. Skipping enrichment for this roadmap course.", courseLevelId);
                coursesSkipped++;
                continue;
            }

            CourseLevel foundCourseLevel = courseLevelOptional.get();
            Course course = foundCourseLevel.getCourse();

            enriched.setCourseName(course.getCourseName());

            logger.debug("Found course '{}' for CourseLevel ID: {}.", course.getCourseName(), courseLevelId);

            if (foundCourseLevel.getLevelName() != levelName) {
                logger.warn("Data inconsistency: LevelName for CourseLevel ID {} ({}) does not match stored LevelName ({}) for roadmap course. Proceeding with database's level.",
                        courseLevelId, foundCourseLevel.getLevelName(), levelName);
            }

            List<Resource> resources = foundCourseLevel.getResources();

            logger.debug("Processing resources for level '{}' of course '{}'. Total resources: {}",
                    foundCourseLevel.getLevelName(), course.getCourseName(), resources.size());

            long numDocs = resources.stream()
                    .filter(r -> r.getResourceType() == ResourceType.DOC)
                    .count();
            long numNotes = resources.stream()
                    .filter(r -> r.getResourceType() == ResourceType.NOTE)
                    .count();
            long numVideos = resources.stream()
                    .filter(r -> r.getResourceType() == ResourceType.VIDEO)
                    .count();

            int totalPossibleXP = resources.stream()
                    .mapToInt(Resource::getResourceXp)
                    .sum();

            int completedXP = 0; // This variable holds the achieved XP

            Set<Long> linkedResourceIds = resources.stream()
                    .filter(r -> r.getResourceType() != ResourceType.QUIZ)
                    .map(Resource::getResourceId)
                    .collect(Collectors.toSet());

            Set<Long> quizResourceIds = resources.stream()
                    .filter(r -> r.getResourceType() == ResourceType.QUIZ && r instanceof QuizResource)
                    .map(Resource::getResourceId)
                    .collect(Collectors.toSet());

            if (!linkedResourceIds.isEmpty()) {
                List<UserLinkedResourceProgress> linkedProgresses =
                        userLinkedResourceProgressRepository.findByUser_IdAndResource_ResourceIdIn(userId, linkedResourceIds);

                Map<Long, UserLinkedResourceProgress> linkedProgressMap = linkedProgresses.stream()
                        .collect(Collectors.toMap(ulrp -> ulrp.getResource().getResourceId(), Function.identity()));

                for (Resource resource : resources) {
                    if (resource.getResourceType() != ResourceType.QUIZ) {
                        UserLinkedResourceProgress progress = linkedProgressMap.get(resource.getResourceId());
                        if (progress != null && progress.isCompletionStatus()) {
                            completedXP += resource.getResourceXp();
                        }
                    }
                }
                logger.debug("User {} completed XP from linked resources: {}", userId, completedXP);
            }

            if (!quizResourceIds.isEmpty()) {
                List<UserQuizQuestionProgress> quizProgresses =
                        userQuizQuestionProgressRepository.findByUser_IdAndQuestionResource_ResourceIdIn(userId, quizResourceIds);

                for (UserQuizQuestionProgress quizProgress : quizProgresses) {
                    // Only add XP if the quiz question was completed AND answered correctly
                    if (quizProgress.isCompleted()) {
                        // MODIFIED LINE: Add the resourceXp of the question resource
                        completedXP += quizProgress.getQuestionResource().getResourceXp();
                    }
                }
                logger.debug("User {} completed XP from quiz questions: {}", userId, completedXP);
            }


            int progressPercentage = 0;
            if (totalPossibleXP > 0) {
                double rawProgress = (double) completedXP / totalPossibleXP * 100;
                progressPercentage = (int) Math.round(rawProgress);
            }
            progressPercentage = Math.max(0, Math.min(100, progressPercentage));

            enriched.setNumDocs(numDocs);
            enriched.setNumNotes(numNotes);
            enriched.setNumVideos(numVideos);
            enriched.setTotalXP(totalPossibleXP);
            enriched.setAchievedXP(completedXP);
            enriched.setProgress(progressPercentage);

            enrichedCourses.add(enriched);
            coursesProcessed++;

            logger.debug("Successfully enriched course level '{}' (Level ID: {}). Docs: {}, Notes: {}, Videos: {}, Total XP: {}, Achieved XP: {}, Progress: {}%",
                    enriched.getCourseName(), enriched.getCourseLevelId(), numDocs, numNotes, numVideos, totalPossibleXP, completedXP, progressPercentage);
        }

        logger.info("Finished processing roadmap courses. {} courses enriched, {} courses skipped.",
                coursesProcessed, coursesSkipped);

        response.setIntroParagraph(userRoadmap.getIntroParagraph());
        response.setCourses(enrichedCourses);

        logger.info("Returning RoadmapResponseDto with {} enriched course levels from roadmap.", enrichedCourses.size());

        return response;
    }
}