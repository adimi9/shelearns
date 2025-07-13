package com.learningplatform.backend.features.dashboard.service;

import com.learningplatform.backend.features.dashboard.client.FastApiClient;

import com.learningplatform.backend.features.dashboard.client.dto.request.AnalysisRequestDto;

import com.learningplatform.backend.features.dashboard.client.dto.response.AnalysisResponseDto;

import com.learningplatform.backend.features.dashboard.dto.response.CourseProgressDTO;

import com.learningplatform.backend.features.dashboard.dto.response.DashboardResponseDTO;

import com.learningplatform.backend.features.dashboard.dto.response.InProgressCourseNameDto;

import com.learningplatform.backend.features.dashboard.dto.response.LeaderboardEntryForDashboard;

import com.learningplatform.backend.features.dashboard.dto.response.QuizResourceDetailDTO;

import com.learningplatform.backend.features.dashboard.dto.response.VideoResourceDetailDTO;

import com.learningplatform.backend.features.dashboard.dto.response.WebResourceDetailDTO;



import com.learningplatform.backend.model.course.progress.UserLinkedResourceProgress;

import com.learningplatform.backend.model.course.progress.UserQuizQuestionProgress;

import com.learningplatform.backend.model.course.resources.Course;

import com.learningplatform.backend.model.course.resources.CourseLevel;

import com.learningplatform.backend.model.course.resources.QuizResource;

import com.learningplatform.backend.model.course.resources.Resource;

import com.learningplatform.backend.model.course.resources.VideoResource;

import com.learningplatform.backend.model.course.resources.WebResource;

import com.learningplatform.backend.model.course.resources.enums.ResourceType;

import com.learningplatform.backend.model.user.onboarding.UserOnboardingData;

import com.learningplatform.backend.model.user.profile.UserProfile;

import com.learningplatform.backend.model.course.roadmap.UserRoadmap;

import com.learningplatform.backend.model.course.roadmap.UserRoadmapCourse;



import com.learningplatform.backend.repository.course.progress.UserLinkedResourceProgressRepository;

import com.learningplatform.backend.repository.course.progress.UserQuizQuestionProgressRepository;

import com.learningplatform.backend.repository.course.resources.CourseRepository;

import com.learningplatform.backend.repository.course.resources.ResourceRepository;

import com.learningplatform.backend.repository.user.UserRepository;

import com.learningplatform.backend.repository.user.badges.UserBadgeRepository;

import com.learningplatform.backend.repository.user.onboarding.UserOnboardingDataRepository;

import com.learningplatform.backend.repository.user.profile.UserProfileRepository;

import com.learningplatform.backend.repository.course.roadmap.UserRoadmapRepository;

import com.learningplatform.backend.repository.course.resources.CourseLevelRepository;



import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import org.slf4j.Logger;

import org.slf4j.LoggerFactory;





import java.util.ArrayList;

import java.util.Comparator;

import java.util.HashMap;

import java.util.List;

import java.util.Map;

import java.util.Optional;

import java.util.Set;

import java.util.function.Function;

import java.util.stream.Collectors;

// --- NEW IMPORTS (for ObjectMapper to help with debugging if needed) ---
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
// --- END NEW IMPORTS ---

@Service
public class DashboardService {

    private static final Logger logger = LoggerFactory.getLogger(DashboardService.class);

    @Autowired
    private UserLinkedResourceProgressRepository userLinkedResourceProgressRepository;

    @Autowired
    private UserQuizQuestionProgressRepository userQuizQuestionProgressRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private FastApiClient fastApiClient;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private UserBadgeRepository userBadgeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserOnboardingDataRepository userOnboardingDataRepository;

    @Autowired
    private CourseLevelRepository courseLevelRepository;

    @Autowired
    private UserRoadmapRepository userRoadmapRepository;

    // --- NEW: Inject ObjectMapper ---
    @Autowired
    private ObjectMapper objectMapper;
    // --- END NEW ---


    @Transactional(readOnly = true)
    public DashboardResponseDTO getDashboardData(Long userId, boolean skipAiSummary) {
        List<CourseProgressDTO> allLevelsWithProgress = new ArrayList<>();

        Map<Long, UserLinkedResourceProgress> userResourceProgressMap =
                userLinkedResourceProgressRepository.findByUserId(userId).stream()
                        .collect(Collectors.toMap(
                                progress -> progress.getResource().getResourceId(),
                                Function.identity(),
                                (existing, replacement) -> replacement
                        ));


        Map<Long, List<UserQuizQuestionProgress>> userQuizProgressMap = new HashMap<>();
        Set<Long> allQuizResourceIds = new java.util.HashSet<>();

        // Fetch the user's roadmap
        Optional<UserRoadmap> userRoadmapOptional = userRoadmapRepository.findByUserId(userId);
        List<UserRoadmapCourse> recommendedRoadmapCourses = userRoadmapOptional
                .map(UserRoadmap::getRecommendedCourses)
                .orElseGet(ArrayList::new);

        // Collect all quiz resource IDs from the recommended roadmap courses
        for (UserRoadmapCourse roadmapCourseEntry : recommendedRoadmapCourses) {
            Long courseLevelId = roadmapCourseEntry.getCourseLevelId();
            Optional<CourseLevel> courseLevelOptional = courseLevelRepository.findById(courseLevelId);
            if (courseLevelOptional.isPresent()) {
                CourseLevel level = courseLevelOptional.get();
                resourceRepository.findByCourseLevel_LevelId(level.getLevelId()).stream()
                        .filter(r -> r.getResourceType() == ResourceType.QUIZ)
                        .map(Resource::getResourceId)
                        .forEach(allQuizResourceIds::add);
            }
        }

        if (!allQuizResourceIds.isEmpty()) {
            userQuizQuestionProgressRepository.findByUser_IdAndQuestionResource_ResourceIdIn(userId, allQuizResourceIds)
                    .forEach(progress -> userQuizProgressMap.computeIfAbsent(progress.getQuestionResource().getResourceId(), k -> new ArrayList<>()).add(progress));
        }

        List<CourseProgressDTO> completedCoursesForFastApi = new ArrayList<>();
        List<InProgressCourseNameDto> inProgressCoursesForFastApi = new ArrayList<>();
        Set<String> inProgressCourseIdsTracker = new java.util.HashSet<>();

        // Iterate over each recommended course level in the roadmap, sorted by courseOrder
        List<UserRoadmapCourse> sortedRoadmapCourses = recommendedRoadmapCourses.stream()
                .sorted(Comparator.comparingInt(UserRoadmapCourse::getCourseOrder))
                .collect(Collectors.toList());

        for (UserRoadmapCourse roadmapCourseEntry : sortedRoadmapCourses) {
            Long courseLevelId = roadmapCourseEntry.getCourseLevelId();
            Optional<CourseLevel> courseLevelOptional = courseLevelRepository.findById(courseLevelId);

            if (courseLevelOptional.isEmpty()) {
                logger.warn("CourseLevel with ID {} from roadmap not found in database. Skipping.", courseLevelId);
                continue;
            }

            CourseLevel level = courseLevelOptional.get();
            Course course = level.getCourse();

            CourseProgressDTO courseProgressDTO = new CourseProgressDTO();
            courseProgressDTO.setCourseId(course.getCourseId());
            courseProgressDTO.setCourseName(course.getCourseName());
            courseProgressDTO.setCourseCategory(course.getCourseCategory());
            courseProgressDTO.setLevelId(level.getLevelId());
            courseProgressDTO.setLevelName(level.getLevelName());

            List<VideoResourceDetailDTO> videoResourcesForDto = new ArrayList<>();
            List<WebResourceDetailDTO> webResourcesForDto = new ArrayList<>();
            List<QuizResourceDetailDTO> quizResourcesForDto = new ArrayList<>();

            List<Resource> resourcesInLevel = resourceRepository.findByCourseLevel_LevelId(level.getLevelId());

            long completedResourcesCount = 0;
            long inProgressResourcesCount = 0;
            long notStartedResourcesCountForLevel = 0;

            for (Resource resource : resourcesInLevel) {
                boolean resourceCompletedByUser = false;

                if (resource.getResourceType() == ResourceType.QUIZ) {
                    List<UserQuizQuestionProgress> userAttempts = userQuizProgressMap.get(resource.getResourceId());
                    if (userAttempts != null && !userAttempts.isEmpty()) {
                        Optional<UserQuizQuestionProgress> latestCompletedAttempt = userAttempts.stream()
                                .filter(UserQuizQuestionProgress::isCompleted)
                                .sorted((a1, a2) -> a2.getId().compareTo(a1.getId()))
                                .findFirst();

                        resourceCompletedByUser = latestCompletedAttempt.isPresent();

                        QuizResource quizResource = (QuizResource) resource;
                        QuizResourceDetailDTO quizDetailDTO = new QuizResourceDetailDTO(
                                quizResource.getResourceId(), quizResource.getResourceType(), quizResource.getResourceOrder(),
                                quizResource.getResourceXp(), resourceCompletedByUser, quizResource.getQuestion(),
                                quizResource.getOption1(), quizResource.getOption2(), quizResource.getOption3(),
                                quizResource.getOption4(), quizResource.getCorrectOption(), quizResource.getHint(),
                                null, false, null, false
                        );

                        latestCompletedAttempt.ifPresent(attempt -> {
                            quizDetailDTO.setUserSelectedOption(attempt.getSelectedOption());
                            quizDetailDTO.setUserIsCorrect(attempt.isCorrect());
                            quizDetailDTO.setUserScore(attempt.getScore());
                            quizDetailDTO.setUserQuizCompleted(attempt.isCompleted());
                        });

                        if (!resourceCompletedByUser && userAttempts.stream().anyMatch(attempt -> attempt.getId() != null)) {
                            inProgressResourcesCount++;
                        } else if (!resourceCompletedByUser && !userAttempts.stream().anyMatch(attempt -> attempt.getId() != null)) {
                            notStartedResourcesCountForLevel++;
                        }
                        quizResourcesForDto.add(quizDetailDTO);

                    } else {
                        notStartedResourcesCountForLevel++;
                        QuizResource quizResource = (QuizResource) resource;
                        quizResourcesForDto.add(
                                new QuizResourceDetailDTO(
                                        quizResource.getResourceId(), quizResource.getResourceType(), quizResource.getResourceOrder(),
                                        quizResource.getResourceXp(), false, quizResource.getQuestion(),
                                        quizResource.getOption1(), quizResource.getOption2(), quizResource.getOption3(),
                                        quizResource.getOption4(), quizResource.getCorrectOption(), quizResource.getHint(),
                                        null, false, null, false
                                )
                        );
                    }
                } else {
                    boolean resourceAttempted = userResourceProgressMap.containsKey(resource.getResourceId());
                    resourceCompletedByUser = resourceAttempted && userResourceProgressMap.get(resource.getResourceId()).isCompletionStatus();

                    if (!resourceCompletedByUser && resourceAttempted) {
                        inProgressResourcesCount++;
                    } else if (!resourceCompletedByUser && !resourceAttempted) {
                        notStartedResourcesCountForLevel++;
                    }

                    if (resource instanceof VideoResource) {
                        VideoResource videoResource = (VideoResource) resource;
                        videoResourcesForDto.add(
                                new VideoResourceDetailDTO(
                                        videoResource.getResourceId(), videoResource.getResourceType(), videoResource.getResourceOrder(),
                                        videoResource.getResourceXp(), resourceCompletedByUser, videoResource.getName(),
                                        videoResource.getDuration(), videoResource.getLink()
                                )
                        );
                    } else if (resource instanceof WebResource) {
                        WebResource webResource = (WebResource) resource;
                        // --- FIX START ---
                        String webResourceName = webResource.getName();
                        if (webResourceName == null || webResourceName.trim().isEmpty()) {
                            // Log a warning for debugging and provide a default name
                            logger.warn("WebResource ID {} has a null or empty name. Providing a default.", webResource.getResourceId());
                            webResourceName = "Unnamed Web Resource " + webResource.getResourceId(); // Or just "" if FastAPI allows empty string
                        }
                        webResourcesForDto.add(
                                new WebResourceDetailDTO(
                                        webResource.getResourceId(), webResource.getResourceType(), webResource.getResourceOrder(),
                                        webResource.getResourceXp(), resourceCompletedByUser, webResourceName, // Pass the non-null name
                                        webResource.getDescription(), webResource.getLink()
                                )
                        );
                        // --- FIX END ---
                    }
                }

                if (resourceCompletedByUser) {
                    completedResourcesCount++;
                }
            }

            courseProgressDTO.setTotalResourcesInLevel((long) resourcesInLevel.size());
            courseProgressDTO.setCompletedResourcesCount(completedResourcesCount);
            courseProgressDTO.setInProgressResourcesCount(inProgressResourcesCount);
            courseProgressDTO.setNotStartedResourcesCount(notStartedResourcesCountForLevel);

            double levelProgressPercentage = (resourcesInLevel.isEmpty()) ? 0.0 :
                    (double) completedResourcesCount / resourcesInLevel.size() * 100;
            courseProgressDTO.setLevelOverallProgressPercentage(levelProgressPercentage);

            courseProgressDTO.setVideoResources(videoResourcesForDto);
            courseProgressDTO.setWebResources(webResourcesForDto);
            courseProgressDTO.setQuizResources(quizResourcesForDto);

            // Add the level to the list if it has resources or if it's explicitly part of the roadmap
            if (!resourcesInLevel.isEmpty() && (completedResourcesCount > 0 || inProgressResourcesCount > 0)) {
                allLevelsWithProgress.add(courseProgressDTO);
            } else if (resourcesInLevel.isEmpty()) {
                allLevelsWithProgress.add(courseProgressDTO);
            }

            // Prepare data for FastAPI analysis (per level or course)
            if (levelProgressPercentage == 100.0 && resourcesInLevel.size() > 0) {
                completedCoursesForFastApi.add(courseProgressDTO);
            } else if (completedResourcesCount > 0 || inProgressResourcesCount > 0) {
                String courseId = String.valueOf(course.getCourseId());
                if (!inProgressCourseIdsTracker.contains(courseId)) {
                    inProgressCoursesForFastApi.add(new InProgressCourseNameDto(courseId, course.getCourseName()));
                    inProgressCourseIdsTracker.add(courseId);
                }
            }
        } // End of for (UserRoadmapCourse roadmapCourseEntry : sortedRoadmapCourses) loop

        if (completedCoursesForFastApi.isEmpty()) {
            logger.info("No completed courses found for user ID: {}. Returning partial dashboard response.", userId);

            // --- Calculate New Data Points for DashboardResponseDTO for the partial response ---
            UserProfile userProfile = userProfileRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("User profile not found for user ID: " + userId));

            int currentLoginStreak = userProfile.getCurrentLoginStreak();
            int totalXp = userProfile.getTotalXp();
            int weeklyXp = userProfile.getWeeklyXp();

            long totalBadgesEarned = userBadgeRepository.countByUserId(userId);

            UserOnboardingData userOnboardingData = userOnboardingDataRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("User onboarding data not found for user ID: " + userId));
            String userLearningPath = userOnboardingData.getAns1();

            // These will be default values if no courses are completed and thus no analysis is performed
            int leaderboardRank = -1;
            int totalUsersInLearningPath = 0;
            int numberOfCoursesCompleted = 0;
            int numberOfCoursesInProgress = inProgressCoursesForFastApi.size();

            return new DashboardResponseDTO(
                null,
                currentLoginStreak,
                totalXp,
                weeklyXp,
                totalBadgesEarned,
                leaderboardRank,
                totalUsersInLearningPath,
                userLearningPath,
                numberOfCoursesCompleted,
                numberOfCoursesInProgress,
                "No completed courses found. Complete at least one to see comprehensive dashboard analysis."
            );
        }


        // --- Calculate New Data Points for DashboardResponseDTO ---

        UserProfile userProfile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User profile not found for user ID: " + userId));

        int currentLoginStreak = userProfile.getCurrentLoginStreak();
        int totalXp = userProfile.getTotalXp();
        int weeklyXp = userProfile.getWeeklyXp();

        long totalBadgesEarned = userBadgeRepository.countByUserId(userId);

        UserOnboardingData userOnboardingData = userOnboardingDataRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User onboarding data not found for user ID: " + userId));
        String userLearningPath = userOnboardingData.getAns1();

        int leaderboardRank = -1;
        int totalUsersInLearningPath = 0;

        List<Object[]> usersWithMatchingAns1Data = userRepository.findAllUsersByOnboardingAns1(userLearningPath);

        List<LeaderboardEntryForDashboard> rankedUsers = usersWithMatchingAns1Data.stream()
                .map(row -> new LeaderboardEntryForDashboard((Long) row[0], (int) row[2]))
                .sorted(Comparator.comparingInt(LeaderboardEntryForDashboard::getWeeklyXp).reversed())
                .collect(Collectors.toList());

        totalUsersInLearningPath = rankedUsers.size();

        for (int i = 0; i < rankedUsers.size(); i++) {
            if (rankedUsers.get(i).getUserId().equals(userId)) {
                leaderboardRank = i + 1;
                break;
            }
        }
        if (leaderboardRank == -1) {
            logger.warn("Current user ID {} not found in personalized leaderboard for path {}", userId, userLearningPath);
        }

        // Recalculate numberOfCoursesCompleted and numberOfCoursesInProgress based on user's roadmap courses
        int numberOfCoursesCompleted = 0;
        int numberOfCoursesInProgress = 0;
        Set<String> processedCourseIdsForCount = new java.util.HashSet<>();

        // Get all unique courses that are part of the user's roadmap
        List<Course> allCoursesInRoadmap = recommendedRoadmapCourses.stream()
                .map(UserRoadmapCourse::getCourseLevelId)
                .map(courseLevelRepository::findById)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .map(CourseLevel::getCourse)
                .distinct()
                .collect(Collectors.toList());

        for (Course course_r : allCoursesInRoadmap) {
            // Only consider levels of this course that are part of the user's roadmap
            List<CourseLevel> relevantLevelsForCourse = course_r.getLevels().stream()
                    .filter(level_r -> recommendedRoadmapCourses.stream()
                            .anyMatch(rc -> rc.getCourseLevelId().equals(level_r.getLevelId())))
                    .collect(Collectors.toList());

            if (relevantLevelsForCourse.isEmpty()) {
                continue;
            }

            boolean courseHasStarted = false;
            boolean courseIsFullyCompleted = true;
            int totalResourcesInCourseAcrossRelevantLevels = 0;

            for (CourseLevel level_r : relevantLevelsForCourse) {
                List<Resource> resourcesInLevel_r = resourceRepository.findByCourseLevel_LevelId(level_r.getLevelId());
                totalResourcesInCourseAcrossRelevantLevels += resourcesInLevel_r.size();

                Optional<CourseProgressDTO> levelProgressOpt = allLevelsWithProgress.stream()
                        .filter(dto -> dto.getLevelId().equals(level_r.getLevelId()))
                        .findFirst();

                if (levelProgressOpt.isPresent()) {
                    CourseProgressDTO levelProgress = levelProgressOpt.get();
                    if (levelProgress.getCompletedResourcesCount() > 0 || levelProgress.getInProgressResourcesCount() > 0) {
                        courseHasStarted = true;
                    }
                    if (levelProgress.getTotalResourcesInLevel() > 0 && levelProgress.getLevelOverallProgressPercentage() < 100.0) {
                        courseIsFullyCompleted = false;
                    }
                } else {
                    if (!resourcesInLevel_r.isEmpty()) {
                        courseIsFullyCompleted = false;
                    }
                }
            }

            if (!processedCourseIdsForCount.contains(String.valueOf(course_r.getCourseId()))) {
                if (totalResourcesInCourseAcrossRelevantLevels == 0 || (courseIsFullyCompleted && totalResourcesInCourseAcrossRelevantLevels > 0) ) {
                    numberOfCoursesCompleted++;
                } else if (courseHasStarted && !courseIsFullyCompleted) {
                    numberOfCoursesInProgress++;
                }
                processedCourseIdsForCount.add(String.valueOf(course_r.getCourseId()));
            }
        }


        // --- Conditional Call to FastAPI Client ---
        AnalysisResponseDto analysisResponse = null;
        if (!skipAiSummary) {
            logger.info("Calling FastAPI for AI analysis for user ID: {}", userId);
            AnalysisRequestDto analysisRequest = new AnalysisRequestDto(completedCoursesForFastApi, inProgressCoursesForFastApi);
            
            // --- NEW: Log the request body for debugging ---
            try {
                String requestBodyJson = objectMapper.writeValueAsString(analysisRequest);
                logger.info("FastAPI /analyze-progress/ request body: {}", requestBodyJson);
            } catch (JsonProcessingException e) {
                logger.error("Error serializing AnalysisRequestDto for logging", e);
            }
            // --- END NEW ---

            analysisResponse = fastApiClient.analyzeProgress(analysisRequest);
        } else {
            logger.info("Skipping FastAPI call for AI analysis for user ID: {} as requested by client.", userId);
        }

        // --- Return the combined response ---
        return new DashboardResponseDTO(
                analysisResponse,
                currentLoginStreak,
                totalXp,
                weeklyXp,
                totalBadgesEarned,
                leaderboardRank,
                totalUsersInLearningPath,
                userLearningPath,
                numberOfCoursesCompleted,
                numberOfCoursesInProgress,
                ""
        );
    }
}