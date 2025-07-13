"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Calendar, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import StudyTimeChart from "@/components/dashboard/study-time-chart";
import ProgressChart from "@/components/dashboard/progress-chart";
import LeaderboardRank from "@/components/dashboard/leaderboard-rank";
import AIProgressSummary from "@/components/dashboard/ai-progress-summary";
import QuickStats from "@/components/dashboard/quick-stats";
import { useUser } from "@/components/context/UserContext";

// Define the expected type for AI Analysis data
interface AiAnalysisData {
  overall_paragraph: string;
  strengths: string[];
  recommendations: string[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoadingUser, fetchUserProfile } = useUser();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [aiSummary, setAiSummary] = useState<AiAnalysisData | null>(null);
  const [isLoadingDashboardContent, setIsLoadingDashboardContent] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoadingUser) {
      setIsLoadingDashboardContent(true);
      return;
    }

    if (!user) {
      setError("You must be logged in to view the dashboard.");
      setIsLoadingDashboardContent(false);
      return;
    }

    const userAiSummaryKey = `aiProgressSummary_${user.username}`;

    const fetchAllDashboardData = async () => {
      setIsLoadingDashboardContent(true);
      setError(null);

      try {
        const authToken = localStorage.getItem("authToken");

        if (!authToken) {
          setError("Authentication token not found. Please log in.");
          setIsLoadingDashboardContent(false);
          return;
        }

        let shouldFetchAiSummaryFromServer = true;
        const cachedAiSummary = localStorage.getItem(userAiSummaryKey);

        if (cachedAiSummary) {
          try {
            const { data, timestamp } = JSON.parse(cachedAiSummary);
            const now = Date.now();
            const oneDay = 24 * 60 * 60 * 1000;

            if (
              now - timestamp < oneDay &&
              typeof data === "object" && data !== null &&
              "overall_paragraph" in data && "strengths" in data && "recommendations" in data
            ) {
              setAiSummary(data as AiAnalysisData);
              shouldFetchAiSummaryFromServer = false;
              console.log("AI summary loaded from local storage for user:", user.username);
            } else {
              console.log("Cached AI summary is stale or malformed for user:", user.username, ", fetching new one.");
              localStorage.removeItem(userAiSummaryKey);
            }
          } catch (parseError) {
            console.error("Failed to parse cached AI summary for user:", user.username, ", fetching new one.", parseError);
            localStorage.removeItem(userAiSummaryKey);
          }
        }

        const headers: HeadersInit = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        };

        if (!shouldFetchAiSummaryFromServer) {
          (headers as any)["X-Skip-AI-Summary"] = "true";
        }

        const response = await fetch("http://localhost:8080/api/dashboard", {
          method: "GET",
          headers: headers,
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 401) {
            localStorage.removeItem("authToken");
            await fetchUserProfile();
            throw new Error("Session expired or invalid. Please log in again.");
          }
          throw new Error(errorData.message || "Failed to fetch dashboard data.");
        }

        const data = await response.json();
        setDashboardData(data);
        console.log("Dashboard data fetched from server for user:", user.username, data);

        if (shouldFetchAiSummaryFromServer && data.aiAnalysis &&
            typeof data.aiAnalysis === 'object' && data.aiAnalysis !== null &&
            'overall_paragraph' in data.aiAnalysis && 'strengths' in data.aiAnalysis && 'recommendations' in data.aiAnalysis) {
          setAiSummary(data.aiAnalysis as AiAnalysisData);
          localStorage.setItem(userAiSummaryKey, JSON.stringify({ data: data.aiAnalysis, timestamp: Date.now() }));
          console.log("AI summary fetched from server and saved to local storage for user:", user.username);
        } else if (shouldFetchAiSummaryFromServer && !data.aiAnalysis) {
            console.warn("AI analysis was expected but not provided by the server or was malformed for user:", user.username);
            setAiSummary(null);
        }

      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || "An unexpected error occurred.");
        setDashboardData(null);
        setAiSummary(null);
      } finally {
        setIsLoadingDashboardContent(false);
      }
    };

    fetchAllDashboardData();
  }, [user?.username, isLoadingUser, fetchUserProfile]);

  if (isLoadingDashboardContent) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center font-inter">
        <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
        <p className="ml-3 text-lg text-gray-700">Loading your personalized dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-4 text-center font-inter">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading Dashboard</h2>
        <p className="text-gray-700 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} className="bg-purple-600 hover:bg-purple-700 text-white">
          Try Again
        </Button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center font-inter">
        <p className="text-lg text-gray-700">No dashboard data available. Please try logging in again.</p>
      </div>
    );
  }

  const {
    currentLoginStreak,
    totalXp,
    weeklyXp,
    totalBadgesEarned,
    leaderboardRank,
    totalUsersInLearningPath,
    userLearningPath,
    numberOfCoursesCompleted,
    numberOfCoursesInProgress,
    totalStudyTime = 0,
    currentWeekStudyTime = 0,
    weeklyGoal = 10,
    currentLevel = "N/A",
    message // Destructure the message from the backend response
  } = dashboardData;

  // Determine if the "no completed courses" message should be shown exclusively
  const showNoCompletedCoursesMessage =
    numberOfCoursesCompleted === 0 && message && message.includes("No completed courses found");

  if (showNoCompletedCoursesMessage) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center font-inter p-4">
        <div className="bg-white border-4 border-black rounded-xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center max-w-md w-full">
          <AlertCircle className="w-10 h-10 inline-block mb-4 text-blue-500" />
          <h3 className="text-2xl font-black text-blue-700 mb-4">Unlock AI Insights!</h3>
          <p className="text-lg text-gray-700 mb-6">
            Complete at least <strong>one course</strong> to receive personalized AI-powered analysis and recommendations for your learning journey.
          </p>
          <p className="text-md text-gray-600">
            Keep up the great work and start your first course today! 🚀
          </p>
          {/* Optional: Add a button to navigate to courses or home */}
          <Button onClick={() => router.push("/roadmap")} className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all duration-200 ease-in-out">
            Explore Courses
          </Button>
        </div>
      </div>
    );
  }

  // If we reach here, it means we have data and don't need the exclusive message,
  // so render the full dashboard.
  const quickStatsUserData = {
    totalStudyTime: totalStudyTime,
    loginStreak: currentLoginStreak,
    totalXP: totalXp,
    badgesEarned: totalBadgesEarned,
    coursesCompleted: numberOfCoursesCompleted,
    coursesInProgress: numberOfCoursesInProgress,
  };

  return (
    <div className="min-h-screen bg-pink-50 font-inter">
      <main className="container mx-auto px-6 py-8">
        {/* Quick Stats Section */}
        <QuickStats userData={quickStatsUserData} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main Content Area (AI Summary, Charts) */}
          <div className="lg:col-span-2 space-y-8">
            {/* AI Progress Summary - will show actual AI analysis if available,
                otherwise the generic "AI analysis not available" fallback */}
            {aiSummary ? (
              <AIProgressSummary aiAnalysis={aiSummary} />
            ) : (
              <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center text-gray-600">
                <AlertCircle className="w-5 h-5 inline-block mr-2 text-gray-500" />
                AI analysis not available for {user?.username || "this user"}.
              </div>
            )}
          </div>

          {/* Sidebar Content Area (Leaderboard, Streak) */}
          <div className="space-y-6">
            {/* Leaderboard Rank */}
            <LeaderboardRank
              rank={leaderboardRank}
              totalUsers={totalUsersInLearningPath}
              weeklyXP={weeklyXp}
              learningPath={userLearningPath}
            />

            {/* Learning Streak Card */}
            <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-6 h-6 text-orange-500" />
                <h3 className="text-lg font-bold">Learning Streak</h3>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">🔥</div>
                <div className="text-2xl font-black text-orange-600 mb-1">{currentLoginStreak} Days</div>
                <div className="text-sm text-gray-600">Keep it up!</div>
              </div>
              <div className="mt-4 p-3 bg-orange-50 border-2 border-orange-200 rounded-lg">
                <p className="text-sm text-orange-700 text-center">
                  You're on fire! 🚀 Come back tomorrow to keep your streak alive.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}