"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Send, Loader2 } from "lucide-react"

type Message = {
  role: "user" | "assistant"
  content: string
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "مرحباً بك في نظام حجز استراحة السلام! كيف يمكنني مساعدتك اليوم؟ يمكنك حجز الاستراحة أو الاستعلام عن حجز موجود أو إلغاء حجز.",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Generate a unique user ID for this session
  const [userId] = useState(`user-${Math.random().toString(36).substring(2, 9)}`)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Add user message to chat
    const userMessage = { role: "user" as const, content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Create context from previous messages
      const context = messages
        .slice(-6) // Include last 6 messages for context
        .map((msg) => `${msg.role === "user" ? "المستخدم" : "المساعد"}: ${msg.content}`)
        .join("\n\n")

      // Use server-side API endpoint instead of direct Groq API call
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

      // Add AI response to chat
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiResponse,
        },
      ])

      // Process the AI response to perform database operations
      await processAIResponse(input, aiResponse, userId)
    } catch (error) {
      console.error("Error generating response:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.",
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

  return (
    <Card className="w-full h-[600px] flex flex-col shadow-lg border-green-200">
      <CardContent className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4">
        <div className="flex-1 overflow-y-auto py-4 flex flex-col space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === "user" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-800"
                }`}
                dir="rtl"
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg px-4 py-2 bg-gray-100 text-gray-800">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p>جاري الكتابة...</p>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>

      <div className="p-4 border-t border-gray-200">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="flex space-x-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اكتب رسالتك هنا..."
            className="flex-1 text-right"
            dir="rtl"
          />
          <Button type="submit" size="icon" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  )
}
