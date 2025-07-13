"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import QuestionCard from "./question-card"
import { AnimatePresence } from "framer-motion"

import { useRoadmapStore } from "@/stores/roadmapStore";


const initialQuestion = {
  question: "What are you interested in learning?",
  options: [
    { id: "frontend", label: "Frontend Development" },
    { id: "backend", label: "Backend Development" },
    { id: "fullstack", label: "Fullstack Development" },
    { id: "mobile", label: "Mobile Development" },
    { id: "game", label: "Game Development" },
    { id: "security", label: "Computer Security" },
    { id: "cs", label: "Computer Science Fundamentals" },
  ],
  allowMultiple: false,
  // specificTech: false, // Removed as it's not used in logic or DTO
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

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Added error state
  const setRoadmapData = useRoadmapStore((state) => state.setData);

  // Use a fallback for NEXT_PUBLIC_BACKEND_URL if not defined in the environment
  const BASE_BACKEND_URL = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BACKEND_URL
    ? process.env.NEXT_PUBLIC_BACKEND_URL
    : 'http://localhost:8080';

  // Total questions: 1 (initial) + 3 (topic-specific) = 4.
  const totalQuestionCount = 4

  const handleNext = async (selectedOptions: string[]) => {
    setError(null); // Clear previous errors on new question/submission attempt
    setUserSelections((prev) => ({
      ...prev,
      [currentQuestionIndex]: selectedOptions,
    }));

    let upcomingQuestions = activeQuestions;

    if (currentQuestionIndex === 0) {
      const selectedTopic = selectedOptions[0];
      const followUpQuestions = topicQuestions[selectedTopic] || [];

      const newQuestionFlow = [initialQuestion, ...followUpQuestions];
      setActiveQuestions(newQuestionFlow);
      upcomingQuestions = newQuestionFlow;
    }

    // last question:
    if (currentQuestionIndex > 0 && currentQuestionIndex === upcomingQuestions.length - 1) {
      setIsLoading(true);

      const finalSelectionsWithIds = {
        ...userSelections,
        [currentQuestionIndex]: selectedOptions, // Ensure the last selection is included
      };

      // Construct the body payload to match OnboardingRequestDto
      const bodyPayload: { [key: string]: string | string[] } = {};

      Object.entries(finalSelectionsWithIds).forEach(([qIndex, ids], i) => {
        const questionIndex = parseInt(qIndex, 10);
        const question = upcomingQuestions[questionIndex]; // Use upcomingQuestions for accurate indexing

        // For the last question (qn4/ans4), send IDs as a list (array)
        if (questionIndex === 3) { // Assuming qn4 is at index 3 (0-indexed)
          bodyPayload[`qn${i + 1}`] = question.question;
          bodyPayload[`ans${i + 1}`] = ids; // Send as array of strings
        } else {
          // For other questions, join labels into a single string
          const labels = ids.map((id) => {
            const option = question.options.find((opt: any) => opt.id === id);
            return option ? option.label : id;
          });
          bodyPayload[`qn${i + 1}`] = question.question;
          bodyPayload[`ans${i + 1}`] = labels.join(", ");
        }
      });

      try {
        // Retrieve token from local storage
        const authToken = localStorage.getItem('authToken');

        if (!authToken) {
          // If no token, set an error and stop the request
          setError("Authentication required. Please log in or sign up first.");
          setIsLoading(false);
          return; // Stop execution
        }

        const response = await fetch(`${BASE_BACKEND_URL}/api/onboarding`, { // Use BASE_BACKEND_URL
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${authToken}`, // Use the retrieved token
          },
          body: JSON.stringify(bodyPayload),
        });

        const responseText = await response.text(); // Read raw response for robust parsing
        console.log("Onboarding Backend Raw Response:", responseText);

        if (!response.ok) {
          let errorData;
          try {
            if (responseText) {
              errorData = JSON.parse(responseText);
            } else {
              errorData = { message: `Roadmap generation failed with status: ${response.status}. No error response body.` };
            }
          } catch (jsonParseError: any) {
            console.error("Error response JSON parsing error:", jsonParseError);
            errorData = { message: `Server error: Could not parse error response. Status: ${response.status}.` };
          }
          throw new Error(errorData.message || `Roadmap generation failed with status: ${response.status}`);
        }

        // Success response: Backend returns {"message": "..."}
        let data;
        try {
          if (responseText) {
            data = JSON.parse(responseText);
          } else {
            console.error("Successful onboarding response had an empty body.");
            throw new Error("Roadmap generation successful, but no confirmation message received.");
          }
        } catch (jsonParseError: any) {
          console.error("Successful response JSON parsing error:", jsonParseError);
          throw new Error("Roadmap generation successful, but failed to parse server response.");
        }

        console.log("Onboarding successful:", data.message); // Log the success message

        setRoadmapData(data);  // Save backend data to global store (if backend sends roadmap data)
                               // Note: Your backend currently returns a String message, not roadmap data.
                               // If `setRoadmapData` expects roadmap structure, you'll need to adjust
                               // the backend's return or how you use `data` here.
        router.push("/roadmap");  // Navigate to roadmap page
      } catch (err: any) {
        console.error("Error calling backend for roadmap generation:", err);
        setError(err.message || "An unexpected error occurred during roadmap generation.");
      } finally {
        setIsLoading(false);
      }

      return;
    }

    setCurrentQuestionIndex((prev) => prev + 1);
  };


  const currentQuestion = activeQuestions[currentQuestionIndex]
  // isLast will be true when currentQuestionIndex is 3 (0-indexed for 4 questions)
  const isLast = currentQuestionIndex === totalQuestionCount - 1;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-600 border-t-transparent"></div>
        <span className="ml-4 text-pink-700 font-bold text-lg">Generating your roadmap...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-6">

      {error && ( // Display error message at the top
        <div className="mb-4 p-3 rounded-lg bg-red-100 border border-red-400 text-red-700 text-center font-semibold max-w-md w-full">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        <QuestionCard
            key={currentQuestionIndex}
            question={currentQuestion.question}
            options={currentQuestion.options}
            allowMultiple={currentQuestion.allowMultiple}
            // specificTech={currentQuestion.specificTech} // Removed
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
