// components/learning/quiz-section.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, HelpCircle, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";

// Define the QuizAnswer interface for submission to backend
interface QuizAnswer {
  resourceId: number;
  selectedOption: number;
}

// Updated Question interface to include backend-provided results
interface Question {
  id: string; // Corresponds to resourceId
  questionText: string;
  options: string[];
  correctAnswerOption: number; // This is the index of the correct option
  hint: string;
  relatedArticles?: Array<{
    title: string;
    url: string;
  }>;
  resourceId: number; // Add resourceId as it's in your data
  resourceType: string;
  resourceXp: number;
  resourceOrder: number;
  completed: boolean; // Individual question completion status
  userAnsweredOption?: string; // Your backend sends this as string, convert to number for logic
  scoreAwarded?: number;
  correctlyAnswered?: boolean;
}

interface QuizSectionProps {
  questions: Question[];
  onComplete: (score: number) => void;
  isCompleted: boolean; // This prop comes from LearningDashboard
  onQuizSubmitBackend: (answers: QuizAnswer[]) => Promise<void>;
  currentCourseLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
}

export default function QuizSection({
  questions,
  onComplete,
  isCompleted: initialIsCompleted, // Renamed to avoid state variable name collision
  onQuizSubmitBackend,
  currentCourseLevel,
}: QuizSectionProps) {
  const router = useRouter();
  const params = useParams();

  // --- Component State ---
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(
    Array(questions.length).fill(-1)
  );
  const [isViewingResults, setIsViewingResults] = useState(false);
  const [showHints, setShowHints] = useState<Set<number>>(new Set());
  const [showArticles, setShowArticles] = useState<Set<number>>(new Set());
  const [isResettingQuiz, setIsResettingQuiz] = useState(false);

  // Local state to manage quiz completion within this component,
  // allowing immediate UI changes on retry before full data re-fetch.
  const [quizCompletedLocally, setQuizCompletedLocally] = useState(initialIsCompleted);
  const [quizOverallScore, setQuizOverallScore] = useState<number | null>(null);
  const [quizDetailedResults, setQuizDetailedResults] = useState<any[] | null>(null);

  // --- Memoized Values ---
  const currentCourseLevelId = useMemo(() => {
    const id = params.courseId;
    return typeof id === 'string' ? parseInt(id, 10) : undefined;
  }, [params.courseId]);

  // Derived score based on current `questions` and `quizOverallScore`
  const derivedOverallScore = useMemo(() => {
    if (!quizCompletedLocally) return null;

    if (quizOverallScore !== null) {
      return quizOverallScore;
    }

    // Fallback for initial load if `quizOverallScore` isn't set yet but questions are marked completed
    return questions.reduce((acc, q) => {
      if (q.completed && typeof q.scoreAwarded === 'number') {
        return acc + q.scoreAwarded;
      }
      return acc;
    }, 0);
  }, [questions, quizCompletedLocally, quizOverallScore]);

  // Derived detailed results based on current `questions` and `quizDetailedResults`
  const derivedDetailedResults = useMemo(() => {
    if (!quizCompletedLocally) return null;

    if (quizDetailedResults !== null) {
      return quizDetailedResults;
    }

    return questions.map(q => ({
      resourceId: q.resourceId,
      questionText: q.questionText,
      submittedOption: q.userAnsweredOption !== undefined ? parseInt(q.userAnsweredOption) : -1,
      correctOption: q.correctAnswerOption,
      scoreAwarded: q.scoreAwarded || 0,
      message: "",
      correct: q.correctlyAnswered || false,
    }));
  }, [questions, quizCompletedLocally, quizDetailedResults]);


  // --- Effects ---
  useEffect(() => {
    // Sync internal `quizCompletedLocally` state with the `initialIsCompleted` prop
    // This runs when the component mounts and when the `initialIsCompleted` prop changes (e.g., after a full page data reload)
    setQuizCompletedLocally(initialIsCompleted);

    if (initialIsCompleted && questions.length > 0) {
      const initialAnswers: number[] = questions.map((q) => {
        return q.userAnsweredOption !== undefined ? parseInt(q.userAnsweredOption) : -1;
      });
      setSelectedAnswers(initialAnswers);
      setIsViewingResults(true);

      // If the quiz is initially completed, calculate and set local score/results based on prop data
      const calculatedScore = questions.reduce((acc, q) => acc + (q.scoreAwarded || 0), 0);
      setQuizOverallScore(calculatedScore);
      setQuizDetailedResults(questions.map(q => ({
        resourceId: q.resourceId,
        questionText: q.questionText,
        submittedOption: q.userAnsweredOption !== undefined ? parseInt(q.userAnsweredOption) : -1,
        correctOption: q.correctAnswerOption,
        scoreAwarded: q.scoreAwarded || 0,
        message: "",
        correct: q.correctlyAnswered || false,
      })));

    } else {
      // Reset all local states if the quiz is not (or no longer) completed
      setSelectedAnswers(Array(questions.length).fill(-1));
      setIsViewingResults(false);
      setShowHints(new Set());
      setShowArticles(new Set());
      setQuizOverallScore(null);
      setQuizDetailedResults(null);
    }
  }, [initialIsCompleted, questions]); // Depend on initialIsCompleted and questions


  // --- Handlers ---
  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    if (isViewingResults) return; // Prevent changing answers if results are already shown

    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (isViewingResults || !allAnswered) return;

    const quizAnswers: QuizAnswer[] = questions.map((q, index) => ({
      resourceId: q.resourceId,
      selectedOption: selectedAnswers[index],
    }));

    try {
      await onQuizSubmitBackend(quizAnswers); // This will trigger a reload in LearningDashboard
      // After onQuizSubmitBackend completes, LearningDashboard will re-fetch course data,
      // which in turn updates `initialIsCompleted` prop to this component,
      // triggering the useEffect above to handle displaying results.
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      // Optionally show a toast notification here if submission fails
    }
  };

  const handleRetry = async () => {
    console.log("Attempting to retry quiz...");
    if (isResettingQuiz || !isViewingResults) {
      console.log("Cannot retry: already resetting or not viewing results.");
      return;
    }

    // Prevent retry if user already passed (score >= 4)
    if (derivedOverallScore !== null && derivedOverallScore >= 4) {
      console.log("Quiz already passed with a good score. No need to retry.");
      // Optionally show a toast here "You already passed this quiz!"
      return;
    }

    setIsResettingQuiz(true); // Set loading state for retry button

    const quizQuestionIdsToReset = questions.map(q => q.resourceId);
    console.log("Quiz question IDs to reset:", quizQuestionIdsToReset);

    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      console.error("Authentication token not found for retry. Redirecting to login.");
      router.push('/login');
      setIsResettingQuiz(false);
      return;
    }

    try {
      console.log("Sending reset request to backend...");
      const response = await fetch('http://localhost:8080/api/progress/quiz/reset', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          resourceIds: quizQuestionIdsToReset,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reset quiz progress on backend.');
      }

      console.log("Quiz progress reset successfully on backend.");

      // ⭐ IMMEDIATE LOCAL STATE RESET:
      // This is crucial for instantly hiding results and progress messages
      setSelectedAnswers(Array(questions.length).fill(-1));
      setIsViewingResults(false);
      setShowHints(new Set());
      setShowArticles(new Set());
      setQuizCompletedLocally(false); // Mark as not completed locally
      setQuizOverallScore(null); // Clear previous score
      setQuizDetailedResults(null); // Clear previous detailed results

      // Trigger a page refresh to get the latest, truly reset data from LearningDashboard
      router.refresh();
      console.log("Page refreshed after quiz reset (local state updated first).");

    } catch (error) {
      console.error("Error during quiz retry (backend reset failed):", error);
      alert(`Failed to reset quiz: ${error instanceof Error ? error.message : String(error)}. Please try again.`);
    } finally {
      setIsResettingQuiz(false); // Turn off loading state
    }
  };

  const toggleHint = (questionIndex: number) => {
    const newHints = new Set(showHints);
    if (newHints.has(questionIndex)) {
      newHints.delete(questionIndex);
    } else {
      newHints.add(questionIndex);
    }
    setShowHints(newHints);
  };

  const toggleArticles = (questionIndex: number) => {
    const newArticles = new Set(showArticles);
    if (newArticles.has(questionIndex)) {
      newArticles.delete(questionIndex);
    } else {
      newArticles.add(questionIndex);
    }
    setShowArticles(newArticles);
  };

  const handleChangeCourseLevel = useCallback(async (newLevelName: "BEGINNER" | "INTERMEDIATE" | "ADVANCED") => {
    if (currentCourseLevelId === undefined) {
      console.error("Current course level ID not found in URL.");
      return;
    }

    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
      console.error("Authentication token not found.");
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/roadmaps/change-level', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          currentCourseLevelId: currentCourseLevelId,
          newLevelName: newLevelName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to change course level to ${newLevelName}`);
      }

      const result = await response.json();
      console.log(`Course level updated to ${newLevelName} successfully:`, result);

      if (result.updatedCourseLevelId) {
        router.push(`/learn/${result.updatedCourseLevelId}`);
      } else {
        console.warn("API response did not contain updatedCourseLevelId for redirection.");
        router.refresh(); // Fallback to refresh if no specific ID to push to
      }

    } catch (error) {
      console.error(`Error changing to ${newLevelName} level:`, error);
      alert(`Failed to change to ${newLevelName} level: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [currentCourseLevelId, router]); // currentCourseLevelId and router are stable dependencies

  const handleExploreOtherCourses = () => {
    console.log("User wants to look at other courses.");
    router.push("/roadmap");
  };

  // --- Derived UI State ---
  // Score to display (either the confirmed overall score or a real-time calculation)
  const scoreToDisplay = derivedOverallScore !== null
    ? derivedOverallScore
    : selectedAnswers.reduce((acc, answer, index) => {
      return acc + (answer === questions[index]?.correctAnswerOption ? 1 : 0);
    }, 0);

  const allAnswered = selectedAnswers.every((answer) => answer !== -1);

  // Conditions for level progression messages, now using `quizCompletedLocally` and `derivedOverallScore`
  const showChallengeAdvancedMessage = quizCompletedLocally && derivedOverallScore !== null &&
                                       derivedOverallScore >= 4 && currentCourseLevel === "INTERMEDIATE";

  const showSuggestBeginnerMessage = quizCompletedLocally && derivedOverallScore !== null &&
                                    derivedOverallScore < 4 && currentCourseLevel === "INTERMEDIATE";

  const showSuggestIntermediateMessage = quizCompletedLocally && derivedOverallScore !== null &&
                                       derivedOverallScore >= 4 && currentCourseLevel === "BEGINNER";

  // --- Render Logic ---
  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-xl shadow-lg p-8 text-center text-gray-700">
        <h2 className="text-2xl font-bold mb-4">No Quiz Questions Available</h2>
        <p>It looks like there are no quiz questions for this section yet. Please check back later!</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-black mb-2">Knowledge Quiz</h2>
        <p className="text-gray-600">Test your understanding with {questions.length} questions</p>
      </div>

      {isViewingResults && derivedDetailedResults ? (
        <div className="bg-white border-4 border-black rounded-xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Quiz Results</h3>
            <div
              className={`text-5xl font-black mb-4 ${
                scoreToDisplay >= 4 ? "text-green-600" : "text-red-600"
              }`}
            >
              {scoreToDisplay}/{questions.length}
            </div>
            <p className="text-lg text-gray-600">
              {scoreToDisplay >= 4
                ? "🎉 Congratulations! You passed!"
                : "📚 You need 4/5 to pass. Keep learning!"}
            </p>
          </div>

          <div className="space-y-6 mb-8">
            {questions.map((question, index) => {
              const isCorrect = question.correctlyAnswered || false;
              const submittedOptionIndex = question.userAnsweredOption !== undefined ? parseInt(question.userAnsweredOption) : -1;
              const correctOptionIndex = question.correctAnswerOption;

              return (
                <div
                  key={question.resourceId}
                  className={`border-2 rounded-lg p-6 ${
                    isCorrect ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-bold mb-3">
                        {index + 1}. {question.questionText}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Your answer:{" "}
                        {submittedOptionIndex !== -1 && question.options[submittedOptionIndex]
                          ? question.options[submittedOptionIndex]
                          : "Not answered"}
                      </p>
                      {!isCorrect && (
                        <>
                          <p className="text-sm text-green-600 mb-4">
                            Correct answer: {question.options[correctOptionIndex]}
                          </p>
                          <div className="flex gap-3 mb-4">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-2 border-black"
                              onClick={() => toggleHint(index)}
                            >
                              <HelpCircle className="w-4 h-4 mr-2" />
                              See Hint
                            </Button>
                          </div>
                          {showHints.has(index) && (
                            <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                              <p className="text-sm font-medium text-yellow-800">💡 Hint:</p>
                              <p className="text-sm text-yellow-700">{question.hint}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center gap-4">
            {/* Try Again Button */}
            {derivedOverallScore !== null && derivedOverallScore < 4 && quizCompletedLocally ? (
              <Button
                onClick={handleRetry}
                disabled={isResettingQuiz} // Disable button when resetting
                className={`bg-pink-600 text-white font-bold px-8 py-4 rounded-xl transition-all ${
                  isResettingQuiz
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-black shadow-[4px_4px_0px_0px_rgba(219,39,119)] hover:translate-y-[-2px]"
                }`}
              >
                {isResettingQuiz ? "Resetting Quiz..." : "Try Again"}
              </Button>
            ) : null}

            {/* Quiz Already Completed / Passed Button (only shown if not triggering other messages) */}
            {derivedOverallScore !== null && derivedOverallScore >= 4 && quizCompletedLocally &&
             !showChallengeAdvancedMessage && !showSuggestIntermediateMessage && (
              <Button
                onClick={() => { /* perhaps a "Review Quiz" button or "Continue" */ }}
                className="bg-gray-400 text-white font-bold px-8 py-4 rounded-xl cursor-not-allowed"
                disabled
              >
                Quiz Already Completed
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border-4 border-black rounded-xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="space-y-8">
            {questions.map((question, questionIndex) => (
              <div
                key={question.resourceId}
                className="border-b-2 border-gray-200 last:border-b-0 pb-8 last:pb-0"
              >
                <h3 className="text-lg font-bold mb-4">
                  {questionIndex + 1}. {question.questionText}
                </h3>
                <div className="space-y-3">
                  {question.options.map((option, optionIndex) => (
                    <label
                      key={optionIndex}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors
                        ${
                          selectedAnswers[questionIndex] === optionIndex
                            ? "border-pink-600 bg-pink-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }
                        ${isViewingResults ? "opacity-70 cursor-not-allowed" : ""}
                      `}
                    >
                      <input
                        type="radio"
                        name={`question-${questionIndex}`}
                        value={optionIndex}
                        checked={selectedAnswers[questionIndex] === optionIndex}
                        onChange={() => handleAnswerSelect(questionIndex, optionIndex)}
                        className="w-5 h-5 text-pink-600 mr-4"
                        disabled={isViewingResults}
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button
              onClick={handleSubmit}
              disabled={!allAnswered || isViewingResults}
              className={`bg-black text-white hover:bg-pink-600 font-bold px-8 py-4 rounded-xl transition-all ${
                (!allAnswered || isViewingResults)
                  ? "opacity-50 cursor-not-allowed"
                  : "shadow-[4px_4px_0px_0px_rgba(219,39,119)] hover:translate-y-[-2px]"
              }`}
            >
              Submit Quiz
            </Button>
            {!allAnswered && !isViewingResults && (
              <p className="text-sm text-gray-500 mt-2">Please answer all questions before submitting</p>
            )}

          </div>
        </div>
      )}

      {/* Intermediate -> Advanced (Pass) */}
      {showChallengeAdvancedMessage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="mt-8 bg-green-50 border-4 border-green-500 rounded-xl p-6 text-center"
        >
          <h4 className="text-xl font-bold mb-3 text-blue-700">Ready for a Challenge? 🚀</h4>
          <p className="text-md mb-6 text-gray-800">
            Congratulations on mastering the Intermediate level! Would you like to <strong>challenge yourself to the Advanced level</strong>?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => handleChangeCourseLevel("ADVANCED")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-y-[-2px]"
            >
              Yes, challenge me!
            </Button>
            <Button
              onClick={handleExploreOtherCourses}
              variant="outline"
              className="border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-bold py-3 rounded-lg"
            >
              No, show me other courses.
            </Button>
          </div>
        </motion.div>
      )}

      {/* Intermediate -> Beginner (Fail) */}
      {showSuggestBeginnerMessage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="mt-8 bg-red-50 border-4 border-red-500 rounded-xl p-6 text-center"
        >
          <h4 className="text-xl font-bold mb-3 text-red-700">Need a Refresher? 💡</h4>
          <p className="text-md mb-6 text-gray-800">
            It looks like this quiz was a bit challenging. Sometimes, revisiting the basics can really help solidify your understanding. Would you like to <strong>try the Beginner level</strong> for this course?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => handleChangeCourseLevel("BEGINNER")}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-y-[-2px]"
            >
              Go to Beginner Level
            </Button>
            <Button
              onClick={handleExploreOtherCourses}
              variant="outline"
              className="border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-bold py-3 rounded-lg"
            >
              Explore Other Courses
            </Button>
          </div>
        </motion.div>
      )}

      {/* Beginner -> Intermediate (Pass) */}
      {showSuggestIntermediateMessage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="mt-8 bg-blue-50 border-4 border-blue-500 rounded-xl p-6 text-center"
        >
          <h4 className="text-xl font-bold mb-3 text-blue-700">Excellent Work! 🎉</h4>
          <p className="text-md mb-6 text-gray-800">
            You've successfully conquered the Beginner level for this course. Your progress is commendable! Ready to <strong>revisit the Intermediate level</strong> and apply your enhanced knowledge? We are confident you'll find it more manageable now.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => handleChangeCourseLevel("INTERMEDIATE")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-y-[-2px]"
            >
              Try Intermediate Again!
            </Button>
            <Button
              onClick={handleExploreOtherCourses}
              variant="outline"
              className="border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-bold py-3 rounded-lg"
            >
              Explore Other Courses
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}