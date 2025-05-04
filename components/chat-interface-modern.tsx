"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2, RefreshCw, Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTheme } from "next-themes"

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
  ])

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { theme } = useTheme()

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
      // Check if message contains OTP code pattern
      if (/^\d{4}$/.test(input.trim())) {
        // Simulate sending email confirmation
        setIsSendingEmail(true)
        await new Promise((resolve) => setTimeout(resolve, 2000))
        setIsSendingEmail(false)
      }

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
      return ["1234", "5678"]
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
    <div className="flex flex-col h-full rounded-lg overflow-hidden border shadow-sm">
      {/* Chat Header */}
      <div className="bg-primary/5 border-b p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src="/images/logo.png" alt="استراحة السلام" />
            <AvatarFallback className="bg-primary text-primary-foreground">اس</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-sm">مساعد استراحة السلام</h3>
            <p className="text-xs text-muted-foreground">متصل الآن</p>
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setMessages([
                    {
                      id: "welcome-reset",
                      role: "assistant",
                      content: "مرحباً بك في نظام حجز استراحة السلام! كيف يمكنني مساعدتك اليوم؟",
                      timestamp: new Date(),
                    },
                  ])
                }}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>بدء محادثة جديدة</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-background">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "mb-4 flex",
                message.role === "user" ? "justify-end" : "justify-start",
                message.role === "system" ? "justify-start mr-12" : "",
              )}
            >
              {message.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground shadow mr-2">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={cn(
                  "px-4 py-2 rounded-lg max-w-[85%] text-sm",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : message.role === "system"
                      ? "bg-muted text-muted-foreground text-xs"
                      : "bg-muted text-foreground rounded-bl-none border",
                )}
                dir="rtl"
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>

              {message.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background shadow ml-2">
                  <User className="h-4 w-4" />
                </div>
              )}
            </motion.div>
          ))}

          {/* Email sending indicator */}
          {isSendingEmail && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
              <Alert className="bg-primary/5 border-primary/20">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <AlertDescription>جاري إرسال رمز التأكيد إلى بريدك الإلكتروني...</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start mb-4"
            >
              <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground shadow mr-2">
                <Bot className="h-4 w-4" />
              </div>
              <div className="px-4 py-2 rounded-lg bg-muted text-foreground rounded-bl-none border">
                <div className="flex space-x-1 items-center h-5">
                  <div
                    className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce"
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
        <div className="px-4 py-2 overflow-x-auto whitespace-nowrap flex gap-2 bg-muted/30 border-t">
          {getSuggestedReplies().map((reply, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="bg-background hover:bg-muted text-xs"
              onClick={() => handleQuickReply(reply)}
            >
              {reply}
            </Button>
          ))}
        </div>
      )}

      {/* Chat Input */}
      <div className="p-4 border-t bg-background">
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
            className="flex-1 text-right focus-visible:ring-primary"
            dir="rtl"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className={cn(
              "bg-primary hover:bg-primary/90 transition-all",
              !input.trim() && "opacity-50 cursor-not-allowed",
            )}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
