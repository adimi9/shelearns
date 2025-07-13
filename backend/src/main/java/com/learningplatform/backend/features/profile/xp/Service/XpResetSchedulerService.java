package com.learningplatform.backend.features.profile.xp.Service;

import com.learningplatform.backend.model.user.profile.UserProfile;
import com.learningplatform.backend.repository.user.profile.UserProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@Service
public class XpResetSchedulerService {

    private static final Logger logger = LoggerFactory.getLogger(XpResetSchedulerService.class);
    private final UserProfileRepository userProfileRepository;

    public XpResetSchedulerService(UserProfileRepository userProfileRepository) {
        this.userProfileRepository = userProfileRepository;
    }

    /**
     * Scheduled task to reset weekly XP for all users every Sunday at 23:59 (11:59 PM).
     * The cron expression "0 59 23 ? * SUN" means:
     * - 0: at second 0
     * - 59: at minute 59
     * - 23: at hour 23 (11 PM)
     * - ?: day of month (any)
     * - *: month (any)
     * - SUN: day of week (Sunday)
     */
    @Scheduled(cron = "0 59 23 ? * SUN")
    @Transactional
    public void resetWeeklyXp() {
        logger.info("Starting weekly XP reset for all users...");
        LocalDateTime resetTime = LocalDateTime.now(); // This will be Sunday 23:59:00

        // Calculate the start of the new week (next Sunday 00:00:00)
        // Or simply set to current resetTime as the lastWeeklyResetTime
        LocalDateTime startOfNextWeek = resetTime.plusMinutes(1).withSecond(0).withNano(0); // Monday 00:00:00 after the reset

        List<UserProfile> allUserProfiles = userProfileRepository.findAll();
        int resetCount = 0;

        for (UserProfile profile : allUserProfiles) {
            // Only reset if the last reset time was *before* this scheduled reset time
            // This handles cases where lazy reset might have just updated it, avoiding redundant resets
            if (profile.getLastWeeklyResetTime().isBefore(resetTime.minusSeconds(1))) { // Minus a second to ensure it covers the window
                 profile.setWeeklyXp(0);
                 profile.setLastWeeklyResetTime(startOfNextWeek); // Set to the very beginning of the new week
                 userProfileRepository.save(profile); // Save each profile
                 resetCount++;
            }
        }
        logger.info("Completed weekly XP reset. {} user profiles had their weekly XP reset.", resetCount);
    }
}
