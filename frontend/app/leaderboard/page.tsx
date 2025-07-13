"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trophy, Zap, Award, Crown, Medal, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedAvatar from "@/components/profile/animated-avatar";

// Define the expected structure of the data from your backend API
interface LeaderboardEntry {
  userId: number;
  username: string;
  weeklyXp: number;
  rank: number;
  avatarType: string;
}

interface LeaderboardResponse {
  top10Users: LeaderboardEntry[];
  currentUserEntry: LeaderboardEntry | null;
  currentUserRankOutOfTotal: number;
  totalUsersInLeaderboard: number;
  xpNeededForTop10: number;
  daysUntilReset: number; // <-- NEW: Added daysUntilReset to the interface
}

const BASE_BACKEND_URL =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_BACKEND_URL
    ? process.env.NEXT_PUBLIC_BACKEND_URL
    : "http://localhost:8080";

export default function LeaderboardPage() {
  const router = useRouter();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const authToken = localStorage.getItem("authToken");

      if (!authToken) {
        console.warn("Auth token not found in local storage. User might not be logged in.");
        setError("You need to be logged in to view the leaderboard.");
        setIsLoading(false);
        // Optionally redirect to login page
        // router.push("/login");
        return;
      }

      const response = await fetch(`${BASE_BACKEND_URL}/api/leaderboard`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch leaderboard. Response status:", response.status);
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch leaderboard data: ${response.statusText}`);
      }
      const data: LeaderboardResponse = await response.json();
      setLeaderboardData(data);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred while fetching leaderboard.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-orange-600" />;
      default:
        return <Star className="w-6 h-6 text-gray-400" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
      case 3:
        return "bg-gradient-to-r from-orange-400 to-orange-600 text-white";
      default:
        return "bg-white border-2 border-gray-200";
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return "👑 Weekly Champion";
      case 2:
        return "🥈 Silver Star";
      case 3:
        return "🥉 Bronze Medal";
      default:
        return null;
    }
  };

  const topUsers = leaderboardData?.top10Users || [];
  const currentUser = leaderboardData?.currentUserEntry;
  const currentUserRankOutOfTotal = leaderboardData?.currentUserRankOutOfTotal || 0;
  const totalUsersInLeaderboard = leaderboardData?.totalUsersInLeaderboard || 0;
  const xpNeededForTop10 = leaderboardData?.xpNeededForTop10 || 0;
  const daysUntilReset = leaderboardData?.daysUntilReset || 0; // <-- NEW: Get daysUntilReset from data

  return (
    <div className="min-h-screen bg-pink-50">
      
      
      <main className="container mx-auto px-6 py-8">
        {isLoading && (
          <div className="text-center text-lg text-gray-600 py-10">Loading leaderboard...</div>
        )}
        {error && (
          <div className="text-center text-red-600 py-10 border border-red-300 bg-red-50 rounded-lg">
            Error: {error}
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Leaderboard */}
            <div className="lg:col-span-2">
              <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-2 mb-6">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  <h3 className="text-xl font-bold">Top {topUsers.length} This Week</h3>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-bold">
                    {/* NEW: Display daysUntilReset from backend */}
                    Resets in {daysUntilReset} {daysUntilReset === 1 ? 'day' : 'days'}
                  </span>
                </div>

                <div className="space-y-3">
                  {topUsers.length === 0 ? (
                    <p className="text-center text-gray-500">No users found for this leaderboard yet. Be the first! 🚀</p>
                  ) : (
                    topUsers.map((user) => (
                      <div
                        key={user.userId}
                        className={`flex items-center gap-4 p-4 rounded-xl transition-all hover:translate-y-[-1px] ${getRankColor(
                          user.rank
                        )} ${user.userId === currentUser?.userId ? "ring-2 ring-pink-500" : ""}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8">
                            {getRankIcon(user.rank)}
                          </div>
                          <span className="font-bold text-lg">#{user.rank}</span>
                        </div>

                        <AnimatedAvatar type={user.avatarType} size="small" />

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold">{user.username}</h4>
                            {getRankBadge(user.rank) && (
                              <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full font-bold">
                                {getRankBadge(user.rank)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center gap-1 font-bold">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            {user.weeklyXp.toLocaleString()}
                          </div>
                          <div className="text-xs opacity-75">this week</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Your Rank */}
              {currentUser ? (
                <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-pink-500" />
                    Your Rank
                  </h3>
                  <div className="text-center">
                    <div className="text-3xl font-black text-pink-600 mb-2">
                      #{currentUserRankOutOfTotal}
                    </div>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <span className="font-bold">{currentUser.weeklyXp.toLocaleString()} XP</span>
                    </div>
                    <div className="text-sm text-gray-600">this week</div>
                    <div className="mt-4 p-3 bg-pink-50 border-2 border-pink-200 rounded-lg">
                      {currentUserRankOutOfTotal > 10 ? (
                        <p className="text-sm text-pink-700">
                          🎯 You need{" "}
                          <span className="font-bold">
                            {xpNeededForTop10.toLocaleString()} XP
                          </span>{" "}
                          to reach top 10!
                        </p>
                      ) : (
                        <p className="text-sm text-pink-700 font-bold">
                          🎉 Great job! You're in the Top 10! Keep it up!
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-pink-500" />
                    Your Rank
                  </h3>
                  <p className="text-center text-gray-500">
                    You are not currently in this leaderboard. Start learning to earn XP!
                  </p>
                </div>
              )}


              {/* Weekly Prizes */}
              <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-orange-500" />
                  Weekly Prizes
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                    <Crown className="w-6 h-6 text-yellow-500" />
                    <div>
                      <div className="font-bold text-yellow-800">1st Place</div>
                      <div className="text-sm text-yellow-600">👑 Champion Badge + 1000 Bonus XP</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 border-2 border-gray-200 rounded-lg">
                    <Medal className="w-6 h-6 text-gray-500" />
                    <div>
                      <div className="font-bold text-gray-800">2nd Place</div>
                      <div className="text-sm text-gray-600">🥈 Silver Badge + 500 Bonus XP</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-orange-50 border-2 border-orange-200 rounded-lg">
                    <Medal className="w-6 h-6 text-orange-500" />
                    <div>
                      <div className="font-bold text-orange-800">3rd Place</div>
                      <div className="text-sm text-orange-600">🥉 Bronze Badge + 250 Bonus XP</div>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <div className="font-bold text-blue-800">Top 10</div>
                    <div className="text-sm text-blue-600">⭐ Elite Badge + 100 Bonus XP</div>
                  </div>
                </div>
              </div>

              {/* Leaderboard Rules */}
              <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-lg font-bold mb-4">How It Works</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>• Leaderboard resets every Monday</p>
                  <p>• Only shows top 25 learners</p>
                  <p>• Separate rankings for each learning path</p>
                  <p>• Earn XP by completing videos, quizzes, and more</p>
                  <p>• Winners get exclusive badges and bonus XP</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}