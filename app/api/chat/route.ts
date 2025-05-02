import { type NextRequest, NextResponse } from "next/server"
import { handleUserMessage } from "@/lib/ai-utils"

export async function POST(req: NextRequest) {
  try {
    const { message, userId } = await req.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Generate a unique user ID if not provided
    const userIdentifier = userId || "anonymous-user"

    // Process the message with our AI handler
    const response = await handleUserMessage(userIdentifier, message)

    // Return the response directly from our AI handler
    return NextResponse.json({ response })
  } catch (error) {
    console.error("Error processing chat:", error)
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 })
  }
}
