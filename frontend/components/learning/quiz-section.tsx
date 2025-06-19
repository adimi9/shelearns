"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, HelpCircle, BookOpen } from "lucide-react"

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  hint: string
  relatedArticles: Array<{
    title: string
    url: string
  }>
}

interface QuizSectionProps {
  questions: Question[]
  onComplete: (score: number) => void
  isCompleted: boolean
  currentScore?: number
}

export default function QuizSection({ questions, onComplete, isCompleted, currentScore }: QuizSectionProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(Array(questions.length).fill(-1))
  const [showResults, setShowResults] = useState(false)
  const [showHints, setShowHints] = useState<Set<number>>(new Set())
  const [showArticles, setShowArticles] = useState<Set<number>>(new Set())
  const [quizAttempts, setQuizAttempts] = useState(0)

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[questionIndex] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const handleSubmit = () => {
    const score = selectedAnswers.reduce((acc, answer, index) => {
      return acc + (answer === questions[index].correctAnswer ? 1 : 0)
    }, 0)

    setShowResults(true)
    setQuizAttempts(quizAttempts + 1)

    if (score >= 4) {
      onComplete(score)
    }
  }

  const handleRetry = () => {
    setSelectedAnswers(Array(questions.length).fill(-1))
    setShowResults(false)
    setShowHints(new Set())
    setShowArticles(new Set())
  }

  const toggleHint = (questionIndex: number) => {
    const newHints = new Set(showHints)
    if (newHints.has(questionIndex)) {
      newHints.delete(questionIndex)
    } else {
      newHints.add(questionIndex)
    }
    setShowHints(newHints)
  }

  const toggleArticles = (questionIndex: number) => {
    const newArticles = new Set(showArticles)
    if (newArticles.has(questionIndex)) {
      newArticles.delete(questionIndex)
    } else {
      newArticles.add(questionIndex)
    }
    setShowArticles(newArticles)
  }

  const score = selectedAnswers.reduce((acc, answer, index) => {
    return acc + (answer === questions[index].correctAnswer ? 1 : 0)
  }, 0)

  const allAnswered = selectedAnswers.every((answer) => answer !== -1)

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-black mb-2">Knowledge Quiz</h2>
        <p className="text-gray-600">Test your understanding with 5 questions</p>
      </div>

      {showResults ? (
        <div className="bg-white border-4 border-black rounded-xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Quiz Results</h3>
            <div className={`text-5xl font-black mb-4 ${score >= 4 ? "text-green-600" : "text-red-600"}`}>
              {score}/5
            </div>
            <p className="text-lg text-gray-600">
              {score >= 4 ? "🎉 Congratulations! You passed!" : "📚 You need 4/5 to pass. Keep learning!"}
            </p>
          </div>

          <div className="space-y-6 mb-8">
            {questions.map((question, index) => {
              const isCorrect = selectedAnswers[index] === question.correctAnswer
              return (
                <div key={question.id} className="border-2 border-gray-200 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-bold mb-3">{question.question}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Your answer: {question.options[selectedAnswers[index]]}
                      </p>
                      {!isCorrect && (
                        <>
                          <p className="text-sm text-green-600 mb-4">
                            Correct answer: {question.options[question.correctAnswer]}
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
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-2 border-black"
                              onClick={() => toggleArticles(index)}
                            >
                              <BookOpen className="w-4 h-4 mr-2" />
                              See Related Articles
                            </Button>
                          </div>
                          {showHints.has(index) && (
                            <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                              <p className="text-sm font-medium text-yellow-800">💡 Hint:</p>
                              <p className="text-sm text-yellow-700">{question.hint}</p>
                            </div>
                          )}
                          {showArticles.has(index) && (
                            <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                              <p className="text-sm font-medium text-blue-800 mb-3">📚 Related Articles:</p>
                              <div className="space-y-2">
                                {question.relatedArticles.map((article, articleIndex) => (
                                  <a
                                    key={articleIndex}
                                    href={article.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-sm text-blue-600 hover:underline"
                                  >
                                    • {article.title}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex justify-center gap-4">
            {score < 4 && (
              <Button
                onClick={handleRetry}
                className="bg-pink-600 hover:bg-black text-white font-bold px-8 py-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(219,39,119)] transition-all hover:translate-y-[-2px]"
              >
                Try Again
              </Button>
            )}
            {score >= 4 && (
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="font-bold text-green-700 text-lg">Quiz Completed Successfully! 🎉</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border-4 border-black rounded-xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="space-y-8">
            {questions.map((question, questionIndex) => (
              <div key={question.id} className="border-b-2 border-gray-200 last:border-b-0 pb-8 last:pb-0">
                <h3 className="text-lg font-bold mb-4">
                  {questionIndex + 1}. {question.question}
                </h3>
                <div className="space-y-3">
                  {question.options.map((option, optionIndex) => (
                    <label
                      key={optionIndex}
                      className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="radio"
                        name={`question-${questionIndex}`}
                        value={optionIndex}
                        checked={selectedAnswers[questionIndex] === optionIndex}
                        onChange={() => handleAnswerSelect(questionIndex, optionIndex)}
                        className="w-5 h-5 text-pink-600 mr-4"
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
              disabled={!allAnswered}
              className={`bg-black text-white hover:bg-pink-600 font-bold px-8 py-4 rounded-xl transition-all ${
                !allAnswered
                  ? "opacity-50 cursor-not-allowed"
                  : "shadow-[4px_4px_0px_0px_rgba(219,39,119)] hover:translate-y-[-2px]"
              }`}
            >
              Submit Quiz
            </Button>
            {!allAnswered && (
              <p className="text-sm text-gray-500 mt-2">Please answer all questions before submitting</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
