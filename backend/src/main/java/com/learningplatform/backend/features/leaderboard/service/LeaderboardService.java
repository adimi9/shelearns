package com.learningplatform.backend.features.leaderboard.service;

import com.learningplatform.backend.features.leaderboard.dto.response.LeaderboardEntryDto;
import com.learningplatform.backend.features.leaderboard.dto.response.LeaderboardResponse;
import com.learningplatform.backend.model.user.onboarding.UserOnboardingData;
import com.learningplatform.backend.repository.user.UserRepository;
import com.learningplatform.backend.repository.user.onboarding.UserOnboardingDataRepository;
import com.learningplatform.backend.repository.user.profile.UserProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.time.Duration;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaderboardService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserOnboardingDataRepository userOnboardingDataRepository;

    public LeaderboardService(UserRepository userRepository,
                              UserProfileRepository userProfileRepository,
                              UserOnboardingDataRepository userOnboardingDataRepository) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.userOnboardingDataRepository = userOnboardingDataRepository;
    }

    @Transactional(readOnly = true)
    public LeaderboardResponse getPersonalizedLeaderboard(Long currentUserId) {
        // 1. Get the current user's onboarding 'ans1'
        UserOnboardingData currentUserOnboarding = userOnboardingDataRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("Onboarding data not found for current user ID: " + currentUserId));
        String currentUserAns1 = currentUserOnboarding.getAns1();

        // 2. Find all users with the same 'ans1'
        List<Object[]> usersWithMatchingAns1Data = userRepository.findAllUsersByOnboardingAns1(currentUserAns1);

        // Map the results to a list of DTOs, sorted by weekly XP
        List<LeaderboardEntryDto> allRankedUsers = usersWithMatchingAns1Data.stream()
                .map(row -> {
                    Long userId = (Long) row[0];
                    String username = (String) row[1];
                    int weeklyXp = (int) row[2];
                    String avatarType = (String) row[3];
                    return new LeaderboardEntryDto(userId, username, weeklyXp, 0, avatarType);
                })
                .sorted(Comparator.comparingInt(LeaderboardEntryDto::getWeeklyXp).reversed())
                .collect(Collectors.toList());

        // 3. Determine current user's rank and overall count
        int currentUserRank = -1;
        LeaderboardEntryDto currentUserEntry = null;
        int totalUsersInLeaderboard = allRankedUsers.size();

        for (int i = 0; i < allRankedUsers.size(); i++) {
            LeaderboardEntryDto entry = allRankedUsers.get(i);
            entry.setRank(i + 1);
            if (entry.getUserId().equals(currentUserId)) {
                currentUserRank = i + 1;
                currentUserEntry = entry;
            }
        }

        if (currentUserEntry == null) {
            throw new IllegalStateException("Current user not found in the personalized leaderboard. Data inconsistency.");
        }

        // 4. Get the top 10 users
        List<LeaderboardEntryDto> top10Users = allRankedUsers.stream()
                .limit(10)
                .collect(Collectors.toList());

        // 5. Calculate XP needed to hit top 10
        int xpNeededForTop10 = 0;
        if (currentUserRank > 10) {
            if (top10Users.size() >= 10) {
                int tenthPlaceXp = top10Users.get(9).getWeeklyXp();
                xpNeededForTop10 = tenthPlaceXp - currentUserEntry.getWeeklyXp();
                if (xpNeededForTop10 < 0) xpNeededForTop10 = 0;
            } else {
                if (!top10Users.isEmpty()) {
                    int lowestTopNXp = top10Users.get(top10Users.size() - 1).getWeeklyXp();
                    xpNeededForTop10 = lowestTopNXp - currentUserEntry.getWeeklyXp();
                    if (xpNeededForTop10 < 0) xpNeededForTop10 = 0;
                } else {
                    xpNeededForTop10 = 0;
                }
            }
        }

        // 6. Calculate days until next weekly reset
        long daysUntilReset = calculateDaysUntilNextReset();

        return new LeaderboardResponse(
                top10Users,
                currentUserEntry,
                currentUserRank,
                totalUsersInLeaderboard,
                xpNeededForTop10,
                daysUntilReset
        );
    }

    /**
     * Calculates the number of full days until the next weekly reset.
     * The reset is defined as the start of Monday (00:00:00).
     */
    private long calculateDaysUntilNextReset() {
        LocalDateTime now = LocalDateTime.now(); // Current time in system default time zone

        // Find the next upcoming Monday at 00:00:00
        // If today is Monday, TemporalAdjusters.nextOrSame(DayOfWeek.MONDAY) would give *this* Monday.
        // If the current time is *after* this Monday's 00:00, then the next reset is the *following* Monday.
        LocalDateTime nextResetTime = now.with(TemporalAdjusters.nextOrSame(DayOfWeek.MONDAY)).toLocalDate().atStartOfDay();

        // If 'now' is already past the 'nextResetTime' (e.g., it's Monday afternoon, and reset was Monday 00:00),
        // then the next reset is actually the Monday of the *following* week.
        if (now.isAfter(nextResetTime)) {
            nextResetTime = nextResetTime.with(TemporalAdjusters.next(DayOfWeek.MONDAY));
        }

        // Calculate the duration
        Duration duration = Duration.between(now, nextResetTime);

        // Return the number of full days
        return duration.toDays();
    }
}