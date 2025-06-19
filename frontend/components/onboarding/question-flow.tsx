"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import QuestionCard from "./question-card"
import { AnimatePresence } from "framer-motion"

const initialQuestion = {
  question: "What are you interested in learning?",
  options: [
    { id: "frontend", label: "Front End Web Development" },
    { id: "backend", label: "Back End Web Development" },
    { id: "fullstack", label: "Full Stack Web Development" },
    { id: "mobile", label: "Mobile App Development" },
    { id: "game", label: "Game Development" },
    { id: "security", label: "Cybersecurity & Ethical Hacking" },
    { id: "cs", label: "Computer Science Foundations" },
  ],
  allowMultiple: false,
  specificTech: false,
}

// Standardized 3-question follow-up for each topic
const topicQuestions: Record<string, any[]> = {
  frontend: [
    {
      question: "Why are you learning Front End Web Development?",
      options: [
        { id: "career", label: "To start or advance my career" },
        { id: "projects", label: "To build my own personal projects" },
        { id: "startup", label: "To create a product or startup" },
        { id: "hobby", label: "As a hobby or for creative expression" },
        { id: "enhance", label: "To enhance my current skillset" },
      ],
    },
    {
      question: "What is your experience with Front End Web Development?",
      options: [
        { id: "beginner", label: "I'm a complete beginner" },
        { id: "html_css", label: "I know basic HTML & CSS" },
        { id: "javascript", label: "I've built things with vanilla JavaScript" },
        { id: "framework_dabble", label: "I have dabbled with a framework (e.g., React)" },
        { id: "professional", label: "I work as a developer" },
      ],
    },
    {
      question: "Are there any specific tools or technologies you're interested in?",
      allowMultiple: true,
      options: [
        { id: "react", label: "React / Next.js" },
        { id: "vue", label: "Vue / Nuxt.js" },
        { id: "css_frameworks", label: "CSS Frameworks (Tailwind, etc.)" },
        { id: "state_management", label: "State Management (Redux, Zustand)" },
        { id: "testing", label: "Testing (Jest, Cypress)" },
      ],
    },
  ],
  backend: [
    {
      question: "Why are you learning Back End Web Development?",
      options: [
        { id: "career", label: "To start or advance my career" },
        { id: "apis", label: "To build robust APIs and services" },
        { id: "fullstack_goal", label: "As a step towards becoming a full-stack developer" },
        { id: "data", label: "To work with databases and data processing" },
        { id: "understand", label: "To understand how the web works 'under the hood'" },
      ],
    },
    {
      question: "What is your experience with Back End Web Development?",
      options: [
        { id: "beginner", label: "I'm a complete beginner" },
        { id: "scripting", label: "I've written scripts (e.g., in Python or JS)" },
        { id: "baas", label: "I've used a BaaS like Firebase or Supabase" },
        { id: "simple_server", label: "I've built a simple server or API" },
        { id: "professional", label: "I work as a developer" },
      ],
    },
    {
      question: "Are there any specific tools or technologies you're interested in?",
      allowMultiple: true,
      options: [
        { id: "nodejs", label: "Node.js (Express, NestJS)" },
        { id: "python", label: "Python (Django, Flask)" },
        { id: "databases", label: "Databases (SQL, NoSQL)" },
        { id: "docker", label: "Containerization (Docker, Kubernetes)" },
        { id: "cloud", label: "Cloud Platforms (AWS, Google Cloud)" },
      ],
    },
  ],
  fullstack: [
    {
      question: "Why are you learning Full Stack Web Development?",
      options: [
        { id: "versatility", label: "To be a versatile, end-to-end developer" },
        { id: "startup", label: "To build and manage my own application" },
        { id: "career", label: "To maximize my career opportunities" },
        { id: "big_picture", label: "To understand the complete development lifecycle" },
        { id: "undecided", label: "I'm not sure if I prefer frontend or backend" },
      ],
    },
    {
      question: "What is your experience with Full Stack Web Development?",
      options: [
        { id: "beginner", label: "I'm a beginner in both frontend and backend" },
        { id: "frontend_heavy", label: "Stronger on frontend, want to learn backend" },
        { id: "backend_heavy", label: "Stronger on backend, want to learn frontend" },
        { id: "dabbled", label: "I have some experience building simple full-stack apps" },
        { id: "professional", label: "I work as a full-stack developer" },
      ],
    },
    {
      question: "Are there any specific tools or technologies you're interested in?",
      allowMultiple: true,
      options: [
        { id: "t3", label: "The T3 Stack (Next, tRPC, Prisma)" },
        { id: "mern", label: "MERN Stack (MongoDB, Express, React, Node)" },
        { id: "graphql", label: "GraphQL" },
        { id: "serverless", label: "Serverless Architecture" },
        { id: "devops", label: "DevOps & CI/CD" },
      ],
    },
  ],
  mobile: [
    {
      question: "Why are you learning Mobile App Development?",
      options: [
        { id: "career", label: "To get a job as a mobile developer" },
        { id: "app_idea", label: "I have a specific app idea I want to build" },
        { id: "reach_users", label: "To reach users on their primary device" },
        { id: "hobby", label: "As a hobby or for personal projects" },
        { id: "new_challenge", label: "To learn a new and challenging skill" },
      ],
    },
    {
      question: "What is your experience with Mobile App Development?",
      options: [
        { id: "beginner", label: "I'm a complete beginner" },
        { id: "web_dev", label: "I have web development experience" },
        { id: "tutorial", label: "I've followed tutorials and built simple apps" },
        { id: "published", label: "I have published an app to an app store" },
        { id: "professional", label: "I work as a mobile developer" },
      ],
    },
    {
      question: "Are there any specific tools or technologies you're interested in?",
      allowMultiple: true,
      options: [
        { id: "react_native", label: "React Native" },
        { id: "flutter", label: "Flutter" },
        { id: "swift", label: "Swift (Native iOS)" },
        { id: "kotlin", label: "Kotlin (Native Android)" },
        { id: "firebase", label: "Mobile Backends (Firebase, Supabase)" },
      ],
    },
  ],
  game: [
    {
      question: "Why are you learning Game Development?",
      options: [
        { id: "career", label: "To work in the games industry" },
        { id: "game_idea", label: "I have a game idea I want to create" },
        { id: "passion", label: "Because I love video games and their creation" },
        { id: "hobby", label: "As a fun and creative hobby" },
        { id: "technical_challenge", label: "For the technical challenge" },
      ],
    },
    {
      question: "What is your experience with Game Development?",
      options: [
        { id: "beginner", label: "I'm a complete beginner" },
        { id: "visual_scripting", label: "I've used visual scripting (e.g., Blueprints)" },
        { id: "game_jam", label: "I've participated in a game jam" },
        { id: "released_game", label: "I have released a small game" },
        { id: "professional", label: "I work in the games industry" },
      ],
    },
    {
      question: "Are there any specific tools or technologies you're interested in?",
      allowMultiple: true,
      options: [
        { id: "unreal", label: "Unreal Engine" },
        { id: "unity", label: "Unity" },
        { id: "godot", label: "Godot" },
        { id: "graphics_programming", label: "Graphics Programming (OpenGL, etc.)" },
        { id: "multiplayer", label: "Multiplayer Networking" },
      ],
    },
  ],
  security: [
    {
      question: "Why are you learning Cybersecurity & Ethical Hacking?",
      options: [
        { id: "career", label: "To start a career in cybersecurity" },
        { id: "secure_code", label: "To learn to write more secure code" },
        { id: "bug_bounty", label: "For bug bounty hunting" },
        { id: "defense", label: "To protect my own/company's assets" },
        { id: "curiosity", label: "I'm fascinated by the world of hacking" },
      ],
    },
    {
      question: "What is your experience with Cybersecurity & Ethical Hacking?",
      options: [
        { id: "beginner", label: "I'm a complete beginner" },
        { id: "networking", label: "I have a good understanding of networking" },
        { id: "developer", label: "I'm a developer with no security focus" },
        { id: "ctf", label: "I have competed in CTF challenges" },
        { id: "professional", label: "I work in a security-related role" },
      ],
    },
    {
      question: "Are there any specific tools or technologies you're interested in?",
      allowMultiple: true,
      options: [
        { id: "pen_testing_tools", label: "Penetration Testing Tools (Kali Linux)" },
        { id: "owasp", label: "OWASP Top 10" },
        { id: "network_analysis", label: "Network Analysis (Wireshark)" },
        { id: "cloud_security", label: "Cloud Security (AWS, Azure)" },
        { id: "reverse_engineering", label: "Reverse Engineering (Ghidra)" },
      ],
    },
  ],
  cs: [
    {
      question: "Why are you learning Computer Science Foundations?",
      options: [
        { id: "interviews", label: "To prepare for technical interviews" },
        { id: "fill_gaps", label: "To fill gaps from being self-taught" },
        { id: "degree_prep", label: "To supplement a university degree" },
        { id: "problem_solving", label: "To become a more effective problem-solver" },
        { id: "advanced_topics", label: "To build a base for advanced topics (AI, etc.)" },
      ],
    },
    {
      question: "What is your experience with Computer Science Foundations?",
      options: [
        { id: "beginner", label: "I'm new to programming and theory" },
        { id: "know_language", label: "I know a language but little theory" },
        { id: "basic_ds", label: "I know basic data structures (Arrays, etc.)" },
        { id: "leetcode_easy", label: "I have solved some LeetCode-style problems" },
        { id: "formal_education", label: "I have some formal CS education" },
      ],
    },
    {
      question: "Are there any specific tools or technologies you're interested in?",
      allowMultiple: true,
      options: [
        { id: "data_structures", label: "Advanced Data Structures" },
        { id: "algorithms", label: "Algorithm Design Paradigms" },
        { id: "big_o", label: "Complexity Analysis (Big O)" },
        { id: "system_design", label: "System Design" },
        { id: "low_level", label: "Low-level Programming (C, Assembly)" },
      ],
    },
  ],
}


export default function QuestionFlow() {

  const router = useRouter()
  const [activeQuestions, setActiveQuestions] = useState([initialQuestion])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userSelections, setUserSelections] = useState<Record<number, string[]>>({})

  // Total questions: 1 (initial) + 3 (topic-specific) = 4.
  const totalQuestionCount = 4

  const handleNext = (selectedOptions: string[]) => {
    setUserSelections((prev) => ({
      ...prev,
      [currentQuestionIndex]: selectedOptions,
    }))

    let upcomingQuestions = activeQuestions

    if (currentQuestionIndex === 0) {
      const selectedTopic = selectedOptions[0]
      const followUpQuestions = topicQuestions[selectedTopic] || []

      const newQuestionFlow = [
        initialQuestion,
        ...followUpQuestions,
      ]
      setActiveQuestions(newQuestionFlow)
      upcomingQuestions = newQuestionFlow
    }

    // last question:
    if (currentQuestionIndex > 0 && currentQuestionIndex === upcomingQuestions.length - 1) {

      // compile the results
      const finalSelectionsWithIds = {
        ...userSelections,
        [currentQuestionIndex]: selectedOptions,
      };

      // Convert selected IDs to their full labels for the final JSON.
      const finalSelectionsWithLabels = Object.fromEntries(
          Object.entries(finalSelectionsWithIds).map(([qIndex, ids]) => {
            const questionIndex = parseInt(qIndex, 10);
            const question = activeQuestions[questionIndex];
            const labels = ids.map(id => {
              const option = question.options.find(opt => opt.id === id);
              return option ? option.label : id; // Fallback to ID if not found
            });
            return [question.question, labels];
          })
      );

      const responsesJSON = JSON.stringify(finalSelectionsWithLabels, null, 2);

      // Log the JSON data to the console to verify it's correct.
      console.log("User's questionnaire responses:", responsesJSON);


      router.push("/roadmap")
      return
    }

    setCurrentQuestionIndex((prev) => prev + 1)
  }

  const currentQuestion = activeQuestions[currentQuestionIndex]
  const isLast = currentQuestionIndex > 0 && currentQuestionIndex === totalQuestionCount - 1;

  return (
      <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-6">

        <AnimatePresence mode="wait">
          <QuestionCard
              key={currentQuestionIndex}
              question={currentQuestion.question}
              options={currentQuestion.options}
              allowMultiple={currentQuestion.allowMultiple}
              specificTech={currentQuestion.specificTech}
              onNext={handleNext}
              isLastQuestion={isLast}
          />
        </AnimatePresence>

        <div className="mt-8 flex gap-2">
          {Array.from({ length: totalQuestionCount }).map((_, index) => (
              <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                      index === currentQuestionIndex ? "bg-pink-600" : index < currentQuestionIndex ? "bg-black" : "bg-gray-300"
                  }`}
              />
          ))}
        </div>
      </div>
  )
}