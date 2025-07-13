package com.learningplatform.backend.features.profile.badges.service;

import com.learningplatform.backend.common.events.QuizSubmissionCompletedEvent;
import com.learningplatform.backend.common.events.ResourceProgressUpdatedEvent;
import com.learningplatform.backend.features.roadmap.overall.service.RoadmapService;
import com.learningplatform.backend.features.roadmap.overall.dto.response.RoadmapResponseDto;
import com.learningplatform.backend.features.roadmap.overall.dto.response.CourseLevelResponseDto;
import com.learningplatform.backend.model.course.progress.UserLinkedResourceProgress;
import com.learningplatform.backend.model.course.progress.UserQuizQuestionProgress;
import com.learningplatform.backend.model.course.resources.CourseLevel;
import com.learningplatform.backend.model.course.resources.QuizResource;
import com.learningplatform.backend.model.course.resources.Resource;
import com.learningplatform.backend.model.course.resources.enums.LevelName;
import com.learningplatform.backend.model.course.resources.enums.ResourceType;
import com.learningplatform.backend.model.user.User;
import com.learningplatform.backend.model.user.badges.enums.BadgeName;
import com.learningplatform.backend.model.user.badges.UserBadge;
import com.learningplatform.backend.repository.course.progress.UserLinkedResourceProgressRepository;
import com.learningplatform.backend.repository.course.progress.UserQuizQuestionProgressRepository;
import com.learningplatform.backend.repository.course.resources.CourseLevelRepository;
import com.learningplatform.backend.repository.course.resources.ResourceRepository;
import com.learningplatform.backend.repository.user.UserRepository;
import com.learningplatform.backend.repository.user.badges.UserBadgeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class BadgeService {

    private static final Logger logger = LoggerFactory.getLogger(BadgeService.class);

    private final UserBadgeRepository userBadgeRepository;
    private final UserRepository userRepository;
    private final UserLinkedResourceProgressRepository userLinkedResourceProgressRepository;
    private final UserQuizQuestionProgressRepository userQuizQuestionProgressRepository;
    private final CourseLevelRepository courseLevelRepository;
    private final RoadmapService roadmapService;
    private final ResourceRepository resourceRepository;

    public BadgeService(UserBadgeRepository userBadgeRepository,
                        UserRepository userRepository,
                        UserLinkedResourceProgressRepository userLinkedResourceProgressRepository,
                        UserQuizQuestionProgressRepository userQuizQuestionProgressRepository,
                        CourseLevelRepository courseLevelRepository,
                        RoadmapService roadmapService,
                        ResourceRepository resourceRepository) {
        this.userBadgeRepository = userBadgeRepository;
        this.userRepository = userRepository;
        this.userLinkedResourceProgressRepository = userLinkedResourceProgressRepository;
        this.userQuizQuestionProgressRepository = userQuizQuestionProgressRepository;
        this.courseLevelRepository = courseLevelRepository;
        this.roadmapService = roadmapService;
        this.resourceRepository = resourceRepository;
        logger.info("BadgeService initialized.");
    }

    /**
     * Listens for resource progress updates and triggers badge checks.
     * Running in a new transaction to ensure badge awards are independent.
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleResourceProgressUpdated(ResourceProgressUpdatedEvent event) {
        logger.info("METHOD CALL: handleResourceProgressUpdated called for userId: {}, resourceId: {}", event.getUserId(), event.getResourceId());
        User user = userRepository.findById(event.getUserId()).orElse(null);
        if (user == null) {
            logger.warn("User {} not found for ResourceProgressUpdatedEvent. Cannot check badges.", event.getUserId());
            return;
        }

        logger.info("Starting badge checks for user: {} after resource progress update.", user.getId());
        checkFirstCourseCompleted(user); // This one already calls it
        checkLearningJourneyProgress(user);
        checkAdvancedCoursesCompletion(user);
        logger.info("Finished all badge checks for user: {} after resource progress update.", user.getId());
    }

    /**
     * Listens for quiz submission completions and triggers badge checks.
     * Running in a new transaction to ensure badge awards are independent.
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleQuizSubmissionCompleted(QuizSubmissionCompletedEvent event) {
        logger.info("METHOD CALL: handleQuizSubmissionCompleted called for userId: {}", event.getUserId());
        User user = userRepository.findById(event.getUserId()).orElse(null);
        if (user == null) {
            logger.warn("User {} not found for QuizSubmissionCompletedEvent. Cannot check badges.", event.getUserId());
            return;
        }

        logger.info("Starting badge checks for user: {} after quiz submission.", user.getId());
        checkFirstCourseCompleted(user); // ✨ ADDED THIS LINE ✨
        checkFirstQuizCompleted(user);
        checkLearningJourneyProgress(user); // Quizzes also contribute to overall progress
        checkAdvancedCoursesCompletion(user);
        logger.info("Finished all badge checks for user: {} after quiz submission.", user.getId());
    }

    // ... (rest of your BadgeService code remains the same) ...

    /**
     * Awards a badge to a user if they don't already have it.
     */
    private void awardBadge(User user, BadgeName badgeName) {
        logger.info("ATTEMPTING TO AWARD BADGE: User ID: {}, Badge: {}", user.getId(), badgeName);
        if (!userBadgeRepository.existsByUserAndBadgeName(user, badgeName)) {
            UserBadge newBadge = new UserBadge(user, badgeName);
            userBadgeRepository.save(newBadge);
            logger.info("BADGE AWARDED SUCCESSFULLY! User ID: {}, Badge: {}", user.getId(), badgeName);
        } else {
            logger.info("BADGE ALREADY HELD: User {} already has badge: {}. Skipping award.", user.getId(), badgeName);
        }
    }

    // --- Badge Logic Implementations ---

    /**
     * Badge 1: Completed your first course.
     * A course is considered completed if all its resources within a specific CourseLevel are completed.
     * This logic aligns with how DashboardService calculates level progress.
     */
    private void checkFirstCourseCompleted(User user) {
        logger.info("METHOD CALL: checkFirstCourseCompleted called for user: {}", user.getId());
        if (userBadgeRepository.existsByUserAndBadgeName(user, BadgeName.FIRST_COURSE_COMPLETED)) {
            logger.info("FIRST_COURSE_COMPLETED badge already awarded to user {}. Skipping check.", user.getId());
            return;
        }

        RoadmapResponseDto userRoadmap = roadmapService.getUserRoadmap(user.getId());
        if (userRoadmap == null || userRoadmap.getCourses() == null || userRoadmap.getCourses().isEmpty()) {
            logger.info("User {} has no roadmap courses. Cannot check for FIRST_COURSE_COMPLETED badge.", user.getId());
            return;
        }
        logger.info("User {} has {} courses in their roadmap.", user.getId(), userRoadmap.getCourses().size());


        for (CourseLevelResponseDto clDto : userRoadmap.getCourses()) {
            logger.info("Checking CourseLevel DTO ID: {} for user {}", clDto.getCourseLevelId(), user.getId());
            CourseLevel courseLevel = courseLevelRepository.findById(clDto.getCourseLevelId()).orElse(null);
            if (courseLevel == null) {
                logger.warn("CourseLevel with ID {} from roadmap not found in database. Skipping badge check for this level.", clDto.getCourseLevelId());
                continue;
            }
            logger.info("Found CourseLevel: {} ({}) for user {}", courseLevel.getLevelId(), courseLevel.getLevelName(), user.getId());

            List<Resource> resourcesInLevel = resourceRepository.findByCourseLevel_LevelId(courseLevel.getLevelId());
            logger.info("CourseLevel ID: {} has {} resources.", courseLevel.getLevelId(), resourcesInLevel.size());

            if (resourcesInLevel.isEmpty()) {
                logger.info("CourseLevel ID: {} has no resources. Considering it completed for FIRST_COURSE_COMPLETED badge for user {}.", courseLevel.getLevelId(), user.getId());
                awardBadge(user, BadgeName.FIRST_COURSE_COMPLETED);
                return;
            }

            long totalResources = resourcesInLevel.size();
            long completedResources = countCompletedResourcesInCourseLevel(user, resourcesInLevel);

            logger.info("CourseLevel ID: {} ({}) progress for user {}: Completed {} out of {} resources.",
                    courseLevel.getLevelId(), courseLevel.getLevelName(), user.getId(), completedResources, totalResources);

            if (completedResources == totalResources) {
                logger.info("All resources in CourseLevel ID: {} completed by user {}. Awarding FIRST_COURSE_COMPLETED badge.", user.getId(), courseLevel.getLevelId());
                awardBadge(user, BadgeName.FIRST_COURSE_COMPLETED);
                return;
            }
        }
        logger.info("User {} has not yet completed any course level to earn FIRST_COURSE_COMPLETED badge.", user.getId());
    }

    /**
     * Helper method to count completed resources (linked + quiz questions) within a given list of Resources for a user.
     * This logic mirrors the resource completion check in DashboardService.
     */
    private long countCompletedResourcesInCourseLevel(User user, List<Resource> resourcesInLevel) {
        logger.info("METHOD CALL: countCompletedResourcesInCourseLevel called for user: {} with {} resources.", user.getId(), resourcesInLevel.size());
        if (resourcesInLevel == null || resourcesInLevel.isEmpty()) {
            logger.info("No resources provided to count completion for user {}. Returning 0.", user.getId());
            return 0;
        }

        Set<Long> linkedResourceIds = new HashSet<>();
        Set<Long> quizResourceIds = new HashSet<>();
        
        for (Resource resource : resourcesInLevel) {
            if (resource.getResourceType() == ResourceType.QUIZ && resource instanceof QuizResource) {
                quizResourceIds.add(resource.getResourceId());
            } else {
                linkedResourceIds.add(resource.getResourceId());
            }
        }
        logger.info("Categorized resources for user {}: {} linked resources, {} quiz resources.", user.getId(), linkedResourceIds.size(), quizResourceIds.size());


        long completedCount = 0;

        Map<Long, UserLinkedResourceProgress> userLinkedProgressMap = Collections.emptyMap();
        if (!linkedResourceIds.isEmpty()) {
            List<UserLinkedResourceProgress> fetchedLinkedProgresses = userLinkedResourceProgressRepository.findByUser_IdAndResource_ResourceIdIn(user.getId(), linkedResourceIds);
            userLinkedProgressMap = fetchedLinkedProgresses.stream()
                    .collect(Collectors.toMap(
                            progress -> progress.getResource().getResourceId(),
                            Function.identity(),
                            (existing, replacement) -> replacement
                    ));
            logger.info("Fetched {} linked resource progresses for user {}.", fetchedLinkedProgresses.size(), user.getId());
        }

        Map<Long, List<UserQuizQuestionProgress>> userQuizProgressMap = new HashMap<>();
        if (!quizResourceIds.isEmpty()) {
            List<UserQuizQuestionProgress> fetchedQuizProgresses = userQuizQuestionProgressRepository.findByUser_IdAndQuestionResource_ResourceIdIn(user.getId(), quizResourceIds);
            fetchedQuizProgresses.forEach(progress -> userQuizProgressMap.computeIfAbsent(progress.getQuestionResource().getResourceId(), k -> new ArrayList<>()).add(progress));
            logger.info("Fetched {} quiz question progresses for user {}.", fetchedQuizProgresses.size(), user.getId());
        }

        for (Resource resource : resourcesInLevel) {
            boolean resourceCompletedByUser = false;
            String resourceType = resource.getResourceType().name();

            if (resource.getResourceType() == ResourceType.QUIZ) {
                List<UserQuizQuestionProgress> userAttempts = userQuizProgressMap.get(resource.getResourceId());
                if (userAttempts != null && !userAttempts.isEmpty()) {
                    resourceCompletedByUser = userAttempts.stream().anyMatch(UserQuizQuestionProgress::isCompleted);
                    logger.debug("Quiz Resource ID: {} (type: {}), User {} attempts found: {}. Completed: {}",
                            resource.getResourceId(), resourceType, user.getId(), userAttempts.size(), resourceCompletedByUser);
                } else {
                    logger.debug("Quiz Resource ID: {} (type: {}), No attempts found for user {}. Not completed.",
                            resource.getResourceId(), resourceType, user.getId());
                }
            } else {
                UserLinkedResourceProgress progress = userLinkedProgressMap.get(resource.getResourceId());
                resourceCompletedByUser = (progress != null && progress.isCompletionStatus());
                logger.debug("Linked Resource ID: {} (type: {}), User {} progress found: {}. Completed: {}",
                        resource.getResourceId(), resourceType, user.getId(), (progress != null), resourceCompletedByUser);
            }

            if (resourceCompletedByUser) {
                completedCount++;
                logger.debug("Resource ID: {} counted as completed for user {}. Current completed count: {}.", resource.getResourceId(), user.getId(), completedCount);
            }
        }
        logger.info("Total completed resources for user {} in this course level: {}.", user.getId(), completedCount);
        return completedCount;
    }

    /**
     * Badges 2 & 3: Completed 50% / 100% of your learning journey.
     * This is based on accumulated XP vs. total possible XP in their roadmap.
     */
    private void checkLearningJourneyProgress(User user) {
        logger.info("METHOD CALL: checkLearningJourneyProgress called for user: {}", user.getId());
        RoadmapResponseDto userRoadmap = roadmapService.getUserRoadmap(user.getId());
        if (userRoadmap == null || userRoadmap.getCourses() == null || userRoadmap.getCourses().isEmpty()) {
            logger.info("Roadmap is empty or null for user {}. Cannot check journey progress badges.", user.getId());
            return;
        }

        int totalPossibleXP = 0;
        int achievedXP = 0;

        for (CourseLevelResponseDto clDto : userRoadmap.getCourses()) {
            CourseLevel courseLevel = courseLevelRepository.findById(clDto.getCourseLevelId()).orElse(null);
            if (courseLevel == null) {
                logger.warn("CourseLevel entity not found for CourseLevel DTO ID: {} when calculating XP for user {}. Skipping.", clDto.getCourseLevelId(), user.getId());
                continue;
            }

            int levelTotalXP = courseLevel.getResources().stream().mapToInt(Resource::getResourceXp).sum();
            int levelAchievedXP = calculateAchievedXpForCourseLevel(user, courseLevel);

            totalPossibleXP += levelTotalXP;
            achievedXP += levelAchievedXP;
            logger.info("XP Calculation for CourseLevel ID: {} ({}): Total: {}, Achieved: {} for user {}.",
                    courseLevel.getLevelId(), courseLevel.getLevelName(), levelTotalXP, levelAchievedXP, user.getId());
        }

        if (totalPossibleXP == 0) {
            logger.info("Total possible XP is 0 for user {}. Cannot check journey progress badges.", user.getId());
            return;
        }

        double progressPercentage = (double) achievedXP / totalPossibleXP * 100;
        logger.info("User {} total XP progress: Achieved {} / Total {} ({:.2f}%)",
                user.getId(), achievedXP, totalPossibleXP, progressPercentage);

        if (progressPercentage >= 50 && !userBadgeRepository.existsByUserAndBadgeName(user, BadgeName.FIFTY_PERCENT_JOURNEY)) {
            logger.info("User {} reached 50% journey progress. Awarding FIFTY_PERCENT_JOURNEY badge.", user.getId());
            awardBadge(user, BadgeName.FIFTY_PERCENT_JOURNEY);
        } else if (userBadgeRepository.existsByUserAndBadgeName(user, BadgeName.FIFTY_PERCENT_JOURNEY)) {
            logger.info("User {} already has FIFTY_PERCENT_JOURNEY badge. Skipping award.", user.getId());
        } else {
            logger.info("User {} has not reached 50% journey progress yet.", user.getId());
        }

        if (progressPercentage >= 100 && !userBadgeRepository.existsByUserAndBadgeName(user, BadgeName.ENTIRE_JOURNEY)) {
            logger.info("User {} reached 100% journey progress. Awarding ENTIRE_JOURNEY badge.", user.getId());
            awardBadge(user, BadgeName.ENTIRE_JOURNEY);
        } else if (userBadgeRepository.existsByUserAndBadgeName(user, BadgeName.ENTIRE_JOURNEY)) {
            logger.info("User {} already has ENTIRE_JOURNEY badge. Skipping award.", user.getId());
        } else {
            logger.info("User {} has not reached 100% journey progress yet.", user.getId());
        }
        logger.info("Finished check for LEARNING_JOURNEY progress badges for user: {}", user.getId());
    }

    /** Helper to calculate achieved XP for a given CourseLevel for a user */
    private int calculateAchievedXpForCourseLevel(User user, CourseLevel courseLevel) {
        logger.info("METHOD CALL: calculateAchievedXpForCourseLevel called for user: {} and CourseLevel ID: {}", user.getId(), courseLevel.getLevelId());
        int achievedXP = 0;
        List<Resource> resources = courseLevel.getResources();
        if (resources == null || resources.isEmpty()) {
            logger.info("No resources in CourseLevel ID: {}. Achieved XP is 0.", courseLevel.getLevelId());
            return 0;
        }

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
                    userLinkedResourceProgressRepository.findByUser_IdAndResource_ResourceIdIn(user.getId(), linkedResourceIds);
            Map<Long, UserLinkedResourceProgress> linkedProgressMap = linkedProgresses.stream()
                    .collect(Collectors.toMap(ulrp -> ulrp.getResource().getResourceId(), Function.identity()));

            for (Resource resource : resources) {
                if (resource.getResourceType() != ResourceType.QUIZ) {
                    UserLinkedResourceProgress progress = linkedProgressMap.get(resource.getResourceId());
                    if (progress != null && progress.isCompletionStatus()) {
                        achievedXP += resource.getResourceXp();
                        logger.debug("Added XP for completed linked resource ID: {} (XP: {}) for user {}. Current achieved XP: {}",
                                resource.getResourceId(), resource.getResourceXp(), user.getId(), achievedXP);
                    } else {
                         logger.debug("Linked resource ID: {} not completed for user {}.", resource.getResourceId(), user.getId());
                    }
                }
            }
        }

        if (!quizResourceIds.isEmpty()) {
            List<UserQuizQuestionProgress> quizProgresses =
                    userQuizQuestionProgressRepository.findByUser_IdAndQuestionResource_ResourceIdIn(user.getId(), quizResourceIds);

            for (UserQuizQuestionProgress quizProgress : quizProgresses) {
                if (quizProgress.isCompleted() && quizProgress.isCorrect()) {
                    if (quizProgress.getQuestionResource() != null) {
                        achievedXP += quizProgress.getQuestionResource().getResourceXp();
                        logger.debug("Added XP for correctly completed quiz question ID: {} (XP: {}) for user {}. Current achieved XP: {}",
                                quizProgress.getQuestionResource().getResourceId(), quizProgress.getQuestionResource().getResourceXp(), user.getId(), achievedXP);
                    }
                } else {
                    logger.debug("Quiz question ID: {} not completed or not correct for user {}.", quizProgress.getQuestionResource().getResourceId(), user.getId());
                }
            }
        }
        logger.info("Total achieved XP for user {} in CourseLevel ID {}: {}", user.getId(), courseLevel.getLevelId(), achievedXP);
        return achievedXP;
    }

    /**
     * Badge 4: Completed your first quiz.
     */
    private void checkFirstQuizCompleted(User user) {
        logger.info("METHOD CALL: checkFirstQuizCompleted called for user: {}", user.getId());
        if (userBadgeRepository.existsByUserAndBadgeName(user, BadgeName.FIRST_QUIZ_COMPLETED)) {
            logger.info("FIRST_QUIZ_COMPLETED badge already awarded to user {}. Skipping check.", user.getId());
            return;
        }

        long completedQuizQuestionsCount = userQuizQuestionProgressRepository.findByUser(user).stream()
                .filter(UserQuizQuestionProgress::isCompleted)
                .count();

        logger.info("User {} has completed {} quiz questions.", user.getId(), completedQuizQuestionsCount);

        if (completedQuizQuestionsCount > 0) {
            logger.info("User {} has completed at least one quiz question. Awarding FIRST_QUIZ_COMPLETED badge.", user.getId());
            awardBadge(user, BadgeName.FIRST_QUIZ_COMPLETED);
        } else {
            logger.info("User {} has not completed any quiz questions yet. Cannot award FIRST_QUIZ_COMPLETED badge.", user.getId());
        }
    }

    /**
     * Badge 5: Completed advanced version of all courses.
     * Checks if for every course in the user's roadmap, its ADVANCED level (if it exists) is 100% completed.
     */
    private void checkAdvancedCoursesCompletion(User user) {
        logger.info("METHOD CALL: checkAdvancedCoursesCompletion called for user: {}", user.getId());
        if (userBadgeRepository.existsByUserAndBadgeName(user, BadgeName.ALL_ADVANCED_COURSES)) {
            logger.info("ALL_ADVANCED_COURSES badge already awarded to user {}. Skipping check.", user.getId());
            return;
        }

        RoadmapResponseDto userRoadmap = roadmapService.getUserRoadmap(user.getId());
        if (userRoadmap == null || userRoadmap.getCourses() == null || userRoadmap.getCourses().isEmpty()) {
            logger.info("User {} roadmap is empty or null. Cannot check ALL_ADVANCED_COURSES badge.", user.getId());
            return;
        }

        Set<String> courseIdsInRoadmap = userRoadmap.getCourses().stream()
                .map(clDto -> {
                    Optional<CourseLevel> courseLevelOpt = courseLevelRepository.findById(clDto.getCourseLevelId());
                    return courseLevelOpt.map(cl -> cl.getCourse().getCourseId()).orElse(null);
                })
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());

        if (courseIdsInRoadmap.isEmpty()) {
            logger.info("No distinct courses found in roadmap for user {}. Cannot check ALL_ADVANCED_COURSES badge.", user.getId());
            return;
        }
        logger.info("User {}'s roadmap contains {} distinct course IDs: {}", user.getId(), courseIdsInRoadmap.size(), courseIdsInRoadmap);


        for (String courseId : courseIdsInRoadmap) {
            logger.info("Checking ADVANCED level for Course ID: {} for user {}.", courseId, user.getId());
            Optional<CourseLevel> advancedLevelOptional = courseLevelRepository.findByCourse_CourseIdAndLevelName(courseId, LevelName.ADVANCED);

            if (advancedLevelOptional.isEmpty()) {
                logger.info("Course (ID: {}) does not have an ADVANCED level defined. Cannot award ALL_ADVANCED_COURSES badge for user {}. Returning early.", courseId, user.getId());
                return;
            }

            CourseLevel advancedLevel = advancedLevelOptional.get();
            List<Resource> resourcesInAdvancedLevel = advancedLevel.getResources();
            long totalResourcesInAdvancedLevel = resourcesInAdvancedLevel.size();

            if (totalResourcesInAdvancedLevel == 0) {
                logger.info("ADVANCED level for Course (ID: {}) has no resources. Considering it completed for ALL_ADVANCED_COURSES badge for user {}. Continuing to next course.", courseId, user.getId());
                continue;
            }

            long completedResourcesInAdvancedLevel = countCompletedResourcesInCourseLevel(user, resourcesInAdvancedLevel);
            logger.info("ADVANCED level for Course (ID: {}). Progress for user {}: Completed {} out of {} resources.",
                    courseId, user.getId(), completedResourcesInAdvancedLevel, totalResourcesInAdvancedLevel);

            if (completedResourcesInAdvancedLevel != totalResourcesInAdvancedLevel) {
                logger.info("User {} has not completed ADVANCED level for course ID: {}. Not all advanced courses are complete. Cannot award ALL_ADVANCED_COURSES badge yet.",
                        user.getId(), courseId);
                return;
            }
        }

        logger.info("All relevant ADVANCED levels completed by user {}. Awarding ALL_ADVANCED_COURSES badge.", user.getId());
        awardBadge(user, BadgeName.ALL_ADVANCED_COURSES);
    }
}