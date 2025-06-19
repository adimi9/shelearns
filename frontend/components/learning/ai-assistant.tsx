"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Message {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
}

interface AIAssistantProps {
  isVisible: boolean
  onOpenChange: (isOpen: boolean) => void
}

export default function AIAssistant({ isVisible, onOpenChange }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hi there! I'm your AI learning assistant. How can I help you with your course today?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync with parent component
  useEffect(() => {
    if (isOpen !== isVisible) {
      setIsOpen(isVisible)
    }
  }, [isVisible])

  // Update parent when local state changes
  useEffect(() => {
    onOpenChange(isOpen)
  }, [isOpen, onOpenChange])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    }
  }, [isOpen])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "That's a great question about HTML! The semantic elements like <article>, <section>, and <nav> help improve accessibility and SEO by giving meaning to your page structure.",
        "CSS Flexbox is a one-dimensional layout method designed for laying out items in rows or columns. The main axis is defined by the flex-direction property, and the cross axis runs perpendicular to it.",
        "JavaScript functions are first-class objects, which means they can be passed around like any other value. This is what enables callbacks, higher-order functions, and many other powerful patterns.",
        "When debugging your code, try using console.log() to check variable values at different points in your program. Browser developer tools also offer breakpoints for step-by-step execution.",
        "The box model in CSS describes how elements are rendered with content, padding, border, and margin. Remember that by default, width and height only apply to the content box unless you use box-sizing: border-box.",
      ]

      const aiMessage: Message = {
        id: Date.now().toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        sender: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
    }, 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-14 h-14 rounded-full shadow-lg ${
              isOpen ? "bg-pink-600" : "bg-black"
            } hover:bg-pink-600 transition-colors duration-300`}
          >
            {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
          </Button>
          {!isOpen && (
            <div className="absolute -top-10 right-0 bg-black text-white text-xs py-1 px-3 rounded-lg whitespace-nowrap">
              Ask the learning assistant any questions
            </div>
          )}
        </div>
      </div>

      {/* Chat interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 w-full md:w-[30%] h-full bg-white border-l-4 border-black shadow-xl z-40"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="bg-black text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  <h3 className="font-bold">AI Learning Assistant</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.sender === "user"
                          ? "bg-pink-500 text-white rounded-tr-none"
                          : "bg-gray-100 text-black rounded-tl-none border-2 border-black"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t-2 border-gray-200">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything about your course..."
                    className="border-2 border-black rounded-lg"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    className="bg-pink-600 hover:bg-black"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay when chat is open on mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-30 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
