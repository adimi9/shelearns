package com.learningplatform.backend.features.leaderboard.dto.response;

import java.util.List;

public class LeaderboardResponse {
    private List<LeaderboardEntryDto> top10Users;
    private LeaderboardEntryDto currentUserEntry;
    private int currentUserRankOutOfTotal;
    private int totalUsersInLeaderboard;
    private int xpNeededForTop10; // XP needed to reach the 10th position
    private long daysUntilReset; // <-- NEW FIELD: Days until next weekly reset

    public LeaderboardResponse(List<LeaderboardEntryDto> top10Users, LeaderboardEntryDto currentUserEntry,
                               int currentUserRankOutOfTotal, int totalUsersInLeaderboard,
                               int xpNeededForTop10, long daysUntilReset) { // <-- NEW PARAMETER
        this.top10Users = top10Users;
        this.currentUserEntry = currentUserEntry;
        this.currentUserRankOutOfTotal = currentUserRankOutOfTotal;
        this.totalUsersInLeaderboard = totalUsersInLeaderboard;
        this.xpNeededForTop10 = xpNeededForTop10;
        this.daysUntilReset = daysUntilReset; // <-- ASSIGN NEW FIELD
    }

    // Getters and Setters
    public List<LeaderboardEntryDto> getTop10Users() {
        return top10Users;
    }

    public void setTop10Users(List<LeaderboardEntryDto> top10Users) {
        this.top10Users = top10Users;
    }

    public LeaderboardEntryDto getCurrentUserEntry() {
        return currentUserEntry;
    }

    public void setCurrentUserEntry(LeaderboardEntryDto currentUserEntry) {
        this.currentUserEntry = currentUserEntry;
    }

    public int getCurrentUserRankOutOfTotal() {
        return currentUserRankOutOfTotal;
    }

    public void setCurrentUserRankOutOfTotal(int currentUserRankOutOfTotal) {
        this.currentUserRankOutOfTotal = currentUserRankOutOfTotal;
    }

    public int getTotalUsersInLeaderboard() {
        return totalUsersInLeaderboard;
    }

    public void setTotalUsersInLeaderboard(int totalUsersInLeaderboard) {
        this.totalUsersInLeaderboard = totalUsersInLeaderboard;
    }

    public int getXpNeededForTop10() {
        return xpNeededForTop10;
    }

    public void setXpNeededForTop10(int xpNeededForTop10) {
        this.xpNeededForTop10 = xpNeededForTop10;
    }

    public long getDaysUntilReset() { // <-- NEW GETTER
        return daysUntilReset;
    }

    public void setDaysUntilReset(long daysUntilReset) { // <-- NEW SETTER
        this.daysUntilReset = daysUntilReset;
    }
}