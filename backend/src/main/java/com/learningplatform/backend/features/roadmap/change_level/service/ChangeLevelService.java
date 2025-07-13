package com.learningplatform.backend.features.roadmap.change_level.service;

import com.learningplatform.backend.features.roadmap.change_level.dto.request.ChangeCourseLevelRequestDto;
import com.learningplatform.backend.features.roadmap.change_level.dto.response.ChangeCourseLevelResponseDto;
import com.learningplatform.backend.model.course.progress.UserQuizQuestionProgress; // Import UserQuizQuestionProgress
import com.learningplatform.backend.model.course.roadmap.UserRoadmap;
import com.learningplatform.backend.model.course.roadmap.UserRoadmapCourse;
import com.learningplatform.backend.model.course.resources.CourseLevel;
import com.learningplatform.backend.model.course.resources.QuizResource; // Import QuizResource
import com.learningplatform.backend.model.user.User; // Import User model if not already
import com.learningplatform.backend.repository.course.progress.UserQuizQuestionProgressRepository; // Import UserQuizQuestionProgressRepository
import com.learningplatform.backend.repository.course.resources.CourseLevelRepository;
import com.learningplatform.backend.repository.course.resources.QuizResourceRepository;
import com.learningplatform.backend.repository.course.roadmap.UserRoadmapRepository;
import com.learningplatform.backend.repository.user.UserRepository; // Import UserRepository if not already
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors; // Import Collectors

@Service
public class ChangeLevelService {

    private static final Logger logger = LoggerFactory.getLogger(ChangeLevelService.class);

    private final UserRoadmapRepository userRoadmapRepository;
    private final CourseLevelRepository courseLevelRepository;
    private final QuizResourceRepository quizResourceRepository;
    private final UserRepository userRepository; // Inject UserRepository
    private final UserQuizQuestionProgressRepository userQuizQuestionProgressRepository; // Inject UserQuizQuestionProgressRepository

    public ChangeLevelService(UserRoadmapRepository userRoadmapRepository,
                              CourseLevelRepository courseLevelRepository,
                              QuizResourceRepository quizResourceRepository,
                              UserRepository userRepository, // Add to constructor
                              UserQuizQuestionProgressRepository userQuizQuestionProgressRepository) { // Add to constructor
        this.userRoadmapRepository = userRoadmapRepository;
        this.courseLevelRepository = courseLevelRepository;
        this.quizResourceRepository = quizResourceRepository;
        this.userRepository = userRepository; // Initialize
        this.userQuizQuestionProgressRepository = userQuizQuestionProgressRepository; // Initialize
        logger.info("ChangeLevelService initialized.");
    }

    @Transactional
    public ChangeCourseLevelResponseDto changeCourseLevel(Long userId, ChangeCourseLevelRequestDto request) {
        logger.info("Attempting to change course level for user ID: {}, current CourseLevel ID: {}, new Level: {}",
                userId, request.getCurrentCourseLevelId(), request.getNewLevelName());

        // 1. Find the UserRoadmap
        UserRoadmap userRoadmap = userRoadmapRepository.findByUserId(userId)
                .orElseThrow(() -> {
                    logger.warn("User roadmap not found for user ID: {}", userId);
                    return new IllegalArgumentException("User roadmap not found.");
                });

        // Get the User for later use in resetting quiz progress
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.warn("User not found for user ID: {}", userId);
                    return new IllegalArgumentException("User not found.");
                });

        List<UserRoadmapCourse> recommendedCourses = userRoadmap.getRecommendedCourses();
        if (recommendedCourses == null || recommendedCourses.isEmpty()) {
            logger.warn("No recommended courses in roadmap for user ID: {}", userId);
            return new ChangeCourseLevelResponseDto(false, "No courses found in your roadmap to change.", null, null, null);
        }

        // 2. Find the specific UserRoadmapCourse entry to update
        Optional<UserRoadmapCourse> targetRoadmapCourseOptional = recommendedCourses.stream()
                .filter(rc -> rc.getCourseLevelId().equals(request.getCurrentCourseLevelId()))
                .findFirst();

        if (targetRoadmapCourseOptional.isEmpty()) {
            logger.warn("Target CourseLevel ID {} not found in user {}'s roadmap.", request.getCurrentCourseLevelId(), userId);
            return new ChangeCourseLevelResponseDto(false, "The specified course level was not found in your roadmap.", null, null, null);
        }
        UserRoadmapCourse targetRoadmapCourse = targetRoadmapCourseOptional.get();

        // 3. Find the original CourseLevel to get the parent Course and associated quizzes
        CourseLevel originalCourseLevel = courseLevelRepository.findById(request.getCurrentCourseLevelId())
                .orElseThrow(() -> {
                    logger.error("Original CourseLevel with ID {} not found in database.", request.getCurrentCourseLevelId());
                    return new IllegalArgumentException("Original course level not found in system.");
                });

        String parentCourseId = originalCourseLevel.getCourse().getCourseId();
        String courseName = originalCourseLevel.getCourse().getCourseName();

        // 4. Find the new CourseLevel for the same Course with the new LevelName
        CourseLevel newCourseLevel = courseLevelRepository.findByCourse_CourseIdAndLevelName(parentCourseId, request.getNewLevelName())
                .orElseThrow(() -> {
                    logger.warn("New CourseLevel for Course ID {} and LevelName {} not found in database.", parentCourseId, request.getNewLevelName());
                    return new IllegalArgumentException("The requested level for this course does not exist in the system.");
                });

        // Prevent changing to the same level (no-op)
        if (targetRoadmapCourse.getCourseLevelId().equals(newCourseLevel.getLevelId())) {
            logger.info("User {} attempted to change course level for {} to the same level ({}). No change made.",
                    userId, courseName, newCourseLevel.getLevelName());
            return new ChangeCourseLevelResponseDto(true, "Course is already at the requested level.",
                    targetRoadmapCourse.getCourseLevelId(), targetRoadmapCourse.getLevelName(), courseName);
        }

        // --- Integrated Quiz Reset Logic ---
        // Get all QuizResources associated with the original CourseLevel
        List<QuizResource> quizzesToReset = quizResourceRepository.findByCourseLevel_LevelId(originalCourseLevel.getLevelId());

        if (!quizzesToReset.isEmpty()) {
            List<Long> quizResourceIds = quizzesToReset.stream()
                    .map(QuizResource::getResourceId)
                    .collect(Collectors.toList());

            logger.info("Resetting quiz progress for user ID: {} for {} quizzes from original CourseLevel ID {}.",
                    userId, quizResourceIds.size(), originalCourseLevel.getLevelId());

            for (Long resourceId : quizResourceIds) {
                // Find the user's progress for each quiz question
                List<UserQuizQuestionProgress> progressEntries = userQuizQuestionProgressRepository
                        .findByUserAndQuestionResource_ResourceId(user, resourceId);

                if (!progressEntries.isEmpty()) {
                    // Assuming there's ideally only one entry per user-question pair
                    UserQuizQuestionProgress progress = progressEntries.get(0);

                    // Reset the status
                    progress.setCompleted(false);
                    progress.setIsCorrect(false);
                    progress.setScore(0);
                    progress.setSelectedOption(null); // Clear selected option

                    userQuizQuestionProgressRepository.save(progress); // Save the updated progress
                } else {
                    logger.debug("No existing progress found for user {} and quiz resource {}", userId, resourceId);
                }
            }
            logger.info("Successfully reset quiz progress for user ID: {} for original CourseLevel ID {}.",
                    userId, originalCourseLevel.getLevelId());
        } else {
            logger.info("No quiz resources found for original CourseLevel ID {} to reset for user ID: {}.",
                    originalCourseLevel.getLevelId(), userId);
        }
        // --- End Integrated Quiz Reset Logic ---

        // 5. Update the UserRoadmapCourse entry
        targetRoadmapCourse.setCourseLevelId(newCourseLevel.getLevelId());
        targetRoadmapCourse.setLevelName(newCourseLevel.getLevelName());
        userRoadmapRepository.save(userRoadmap);

        logger.info("Successfully changed course level for user ID: {} from CourseLevel ID {} to new CourseLevel ID {} (Level: {}).",
                userId, request.getCurrentCourseLevelId(), newCourseLevel.getLevelId(), newCourseLevel.getLevelName());

        return new ChangeCourseLevelResponseDto(true, "Course level updated successfully.",
                newCourseLevel.getLevelId(), newCourseLevel.getLevelName(), courseName);
    }
}