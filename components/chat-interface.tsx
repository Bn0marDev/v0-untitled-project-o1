"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2, RefreshCw } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

type Message = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "مرحباً بك في نظام حجز استراحة السلام! كيف يمكنني مساعدتك اليوم؟",
      timestamp: new Date(),
    },
    {
      id: "options",
      role: "system",
      content: "يمكنك:",
      timestamp: new Date(),
    },
    {
      id: "option-1",
      role: "system",
      content: "• حجز الاستراحة ليوم محدد",
      timestamp: new Date(),
    },
    {
      id: "option-2",
      role: "system",
      content: "• الاستعلام عن حجز موجود باستخدام الرمز السري",
      timestamp: new Date(),
    },
    {
      id: "option-3",
      role: "system",
      content: "• إلغاء حجز موجود",
      timestamp: new Date(),
    },
  ])

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Generate a unique user ID for this session
  const [userId] = useState(`user-${Math.random().toString(36).substring(2, 9)}`)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Simulate typing indicator
  const simulateTyping = (response: string) => {
    setIsTyping(true)

    // Clear any existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }

    // Calculate typing time based on response length (min 1s, max 3s)
    const typingTime = Math.min(Math.max(response.length * 20, 1000), 3000)

    const timeout = setTimeout(() => {
      setIsTyping(false)

      // Add the AI response to messages
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response,
          timestamp: new Date(),
        },
      ])
    }, typingTime)

    setTypingTimeout(timeout)

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Add user message to chat
    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user" as const,
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Create context from previous messages (exclude system messages)
      const context = messages
        .filter((msg) => msg.role !== "system")
        .slice(-6) // Include last 6 messages for context
        .map((msg) => `${msg.role === "user" ? "المستخدم" : "المساعد"}: ${msg.content}`)
        .join("\n\n")

      // Use server-side API endpoint
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          userId,
          context,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }

      const data = await response.json()
      const aiResponse = data.response

      // Process the AI response to perform database operations
      await processAIResponse(input, aiResponse, userId)

      // Simulate typing indicator for the response
      simulateTyping(aiResponse)
    } catch (error) {
      console.error("Error generating response:", error)

      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Process AI response to perform database operations
  const processAIResponse = async (userInput: string, aiResponse: string, userId: string) => {
    try {
      // Send the conversation to the backend for processing
      await fetch("/api/process-conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userInput,
          aiResponse,
          userId,
        }),
      })
    } catch (error) {
      console.error("Error processing conversation:", error)
    }
  }

  // Handle quick replies
  const handleQuickReply = (reply: string) => {
    setInput(reply)
    setTimeout(() => {
      handleSendMessage()
    }, 100)
  }

  // Get suggested quick replies based on conversation
  const getSuggestedReplies = () => {
    const lastMessage = messages.filter((m) => m.role === "assistant").pop()

    if (!lastMessage) return []

    if (lastMessage.content.includes("تاريخ") || lastMessage.content.includes("يوم")) {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const nextWeek = new Date(today)
      nextWeek.setDate(nextWeek.getDate() + 7)

      return [`${tomorrow.toISOString().split("T")[0]}`, `${nextWeek.toISOString().split("T")[0]}`]
    }

    if (lastMessage.content.includes("رمز") || lastMessage.content.includes("كود")) {
      return ["123456"]
    }

    if (lastMessage.content.includes("معلومات") || lastMessage.content.includes("بيانات")) {
      return ["محمد علي، 0912345678، example@email.com"]
    }

    if (lastMessage.content.includes("تأكيد") || lastMessage.content.includes("إلغاء")) {
      return ["نعم", "لا"]
    }

    // Default suggestions
    return ["أريد حجز الاستراحة", "لدي استفسار عن حجز", "كيف يمكنني إلغاء الحجز؟"]
  }

  return (
    <div className="flex flex-col h-[700px] rounded-xl overflow-hidden shadow-2xl border border-green-200 bg-gradient-to-br from-white to-green-50">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 border-2 border-white">
            <AvatarImage src="/images/logo.png" alt="استراحة السلام" />
            <AvatarFallback className="bg-green-800 text-white">اس</AvatarFallback>
          </Avatar>
          <div className="mr-3">
            <h3 className="font-bold">مساعد استراحة السلام</h3>
            <p className="text-xs text-green-100">متصل الآن</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-green-600 hover:text-white"
          onClick={() => {
            setMessages([
              {
                id: "welcome-reset",
                role: "assistant",
                content: "مرحباً بك في نظام حجز استراحة السلام! كيف يمكنني مساعدتك اليوم؟",
                timestamp: new Date(),
              },
              {
                id: "options-reset",
                role: "system",
                content: "يمكنك:",
                timestamp: new Date(),
              },
              {
                id: "option-1-reset",
                role: "system",
                content: "• حجز الاستراحة ليوم محدد",
                timestamp: new Date(),
              },
              {
                id: "option-2-reset",
                role: "system",
                content: "• الاستعلام عن حجز موجود باستخدام الرمز السري",
                timestamp: new Date(),
              },
              {
                id: "option-3-reset",
                role: "system",
                content: "• إلغاء حجز موجود",
                timestamp: new Date(),
              },
            ])
          }}
        >
          <RefreshCw className="h-5 w-5" />
        </Button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-opacity-50">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "mb-4 flex",
                message.role === "user" ? "justify-end" : "justify-start",
                message.role === "system" ? "justify-start mr-12" : "",
              )}
            >
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8 mt-1 ml-2">
                  <AvatarImage src="/images/logo.png" alt="استراحة السلام" />
                  <AvatarFallback className="bg-green-700 text-white">اس</AvatarFallback>
                </Avatar>
              )}

              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2",
                  message.role === "user"
                    ? "bg-gradient-to-r from-green-600 to-green-500 text-white rounded-tr-none"
                    : message.role === "system"
                      ? "bg-gray-100 text-gray-800 text-sm"
                      : "bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm",
                )}
                dir="rtl"
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <div className="text-[10px] mt-1 opacity-70 text-left">
                  {message.role !== "system" &&
                    new Intl.DateTimeFormat("ar-LY", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(message.timestamp)}
                </div>
              </div>

              {message.role === "user" && (
                <Avatar className="h-8 w-8 mt-1 mr-2">
                  <AvatarFallback className="bg-gray-400 text-white">أنت</AvatarFallback>
                </Avatar>
              )}
            </motion.div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start mb-4"
            >
              <Avatar className="h-8 w-8 mt-1 ml-2">
                <AvatarImage src="/images/logo.png" alt="استراحة السلام" />
                <AvatarFallback className="bg-green-700 text-white">اس</AvatarFallback>
              </Avatar>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                <div className="flex space-x-1">
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </AnimatePresence>
      </div>

      {/* Quick Replies */}
      {!isLoading && !isTyping && (
        <div className="px-4 py-2 overflow-x-auto whitespace-nowrap flex gap-2 bg-white bg-opacity-70 border-t border-gray-100">
          {getSuggestedReplies().map((reply, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="bg-white hover:bg-green-50 text-green-700 border-green-200 text-xs"
              onClick={() => handleQuickReply(reply)}
            >
              {reply}
            </Button>
          ))}
        </div>
      )}

      {/* Chat Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="flex space-x-2"
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اكتب رسالتك هنا..."
            className="flex-1 text-right border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
            dir="rtl"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className={cn(
              "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 transition-all",
              !input.trim() && "opacity-50 cursor-not-allowed",
            )}
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
