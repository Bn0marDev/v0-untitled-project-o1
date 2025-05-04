import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { sendVerificationEmail, sendBookingConfirmationEmail } from "@/lib/email"

// State management for user conversations
const userStates = new Map<
  string,
  {
    stage: string
    data: Record<string, any>
  }
>()

export async function POST(req: NextRequest) {
  try {
    const { userInput, aiResponse, userId } = await req.json()

    // Get or initialize user state
    let userState = userStates.get(userId)
    if (!userState) {
      userState = { stage: "initial", data: {} }
      userStates.set(userId, userState)
    }

    // Process the conversation based on content
    await processConversation(userInput, aiResponse, userId, userState)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing conversation:", error)
    return NextResponse.json({ error: "Failed to process conversation" }, { status: 500 })
  }
}

async function processConversation(
  userInput: string,
  aiResponse: string,
  userId: string,
  userState: { stage: string; data: Record<string, any> },
) {
  // Extract information from the conversation
  const lowerUserInput = userInput.toLowerCase()
  const lowerAiResponse = aiResponse.toLowerCase()

  // Check for booking intent
  if (
    (lowerUserInput.includes("حجز") || lowerUserInput.includes("book")) &&
    !lowerUserInput.includes("إلغاء") &&
    !lowerUserInput.includes("cancel") &&
    userState.stage === "initial"
  ) {
    userState.stage = "collecting_date"
    return
  }

  // Check for date in user input when in collecting_date stage
  if (userState.stage === "collecting_date") {
    const dateMatch = userInput.match(/\d{4}-\d{2}-\d{2}/) || userInput.match(/\d{1,2}\/\d{1,2}\/\d{4}/)

    if (dateMatch) {
      // Convert to YYYY-MM-DD format if needed
      let bookingDate = dateMatch[0]
      if (bookingDate.includes("/")) {
        const parts = bookingDate.split("/")
        bookingDate = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`
      }

      userState.data.bookingDate = bookingDate
      userState.stage = "collecting_info"
    }
    return
  }

  // Check for customer information when in collecting_info stage
  if (userState.stage === "collecting_info") {
    // Look for email
    const emailMatch = userInput.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
    if (emailMatch) {
      userState.data.email = emailMatch[0]
    }

    // Look for phone number
    const phoneMatch = userInput.match(/\d{10,}/)
    if (phoneMatch) {
      userState.data.phone = phoneMatch[0]
    }

    // Look for name (Arabic characters)
    const nameMatch = userInput.match(/[ء-ي\s]{3,}/)
    if (nameMatch) {
      userState.data.name = nameMatch[0].trim()
    }

    // If we have all the information, create the booking
    if (userState.data.email && userState.data.phone && userState.data.name && userState.data.bookingDate) {
      try {
        // Check if date is available
        const isAvailable = await checkDateAvailability(userState.data.bookingDate)

        if (!isAvailable) {
          userState.stage = "date_unavailable"
          return
        }

        // Create booking
        const { bookingId, bookingReference, secretCode } = await createBooking(
          userState.data.name,
          userState.data.phone,
          userState.data.bookingDate,
        )

        // Generate OTP code
        const otpCode = await createVerificationCode(bookingId)

        // Store booking information
        userState.data.bookingId = bookingId
        userState.data.bookingReference = bookingReference
        userState.data.secretCode = secretCode
        userState.data.otpCode = otpCode

        // Send verification email
        await sendVerificationEmail(
          userState.data.email,
          userState.data.name,
          userState.data.bookingDate,
          otpCode,
          bookingReference,
        )

        userState.stage = "verifying_otp"
      } catch (error) {
        console.error("Error creating booking:", error)
        userState.stage = "booking_error"
      }
    }
    return
  }

  // Check for OTP verification
  if (userState.stage === "verifying_otp") {
    const otpMatch = userInput.match(/\d{4}/)

    if (otpMatch && otpMatch[0] === userState.data.otpCode) {
      try {
        // Mark booking as confirmed
        await confirmBooking(userState.data.bookingId)

        // Send confirmation email
        await sendBookingConfirmationEmail(
          userState.data.email,
          userState.data.name,
          userState.data.bookingDate,
          userState.data.bookingReference,
          userState.data.secretCode,
        )

        userState.stage = "booking_confirmed"
      } catch (error) {
        console.error("Error confirming booking:", error)
        userState.stage = "verification_error"
      }
    }
    return
  }

  // Check for booking inquiry
  if (
    (lowerUserInput.includes("استعلام") || lowerUserInput.includes("حجزي") || lowerUserInput.includes("my booking")) &&
    userState.stage === "initial"
  ) {
    userState.stage = "checking_booking"
    return
  }

  // Check for secret code when checking booking
  if (userState.stage === "checking_booking") {
    const secretCodeMatch = userInput.match(/\d{6}/)

    if (secretCodeMatch) {
      try {
        const booking = await getBookingBySecretCode(secretCodeMatch[0])

        if (booking) {
          userState.data.booking = booking
          userState.stage = "booking_found"
        } else {
          userState.stage = "booking_not_found"
        }
      } catch (error) {
        console.error("Error checking booking:", error)
        userState.stage = "checking_error"
      }
    }
    return
  }

  // Check for cancellation intent
  if ((lowerUserInput.includes("إلغاء") || lowerUserInput.includes("cancel")) && userState.stage === "initial") {
    userState.stage = "cancelling_booking"
    return
  }

  // Check for secret code when cancelling booking
  if (userState.stage === "cancelling_booking") {
    const secretCodeMatch = userInput.match(/\d{6}/)

    if (secretCodeMatch) {
      try {
        const booking = await getBookingBySecretCode(secretCodeMatch[0])

        if (booking) {
          userState.data.booking = booking
          userState.data.secretCode = secretCodeMatch[0]
          userState.stage = "confirm_cancellation"
        } else {
          userState.stage = "booking_not_found"
        }
      } catch (error) {
        console.error("Error checking booking for cancellation:", error)
        userState.stage = "checking_error"
      }
    }
    return
  }

  // Check for cancellation confirmation
  if (userState.stage === "confirm_cancellation") {
    if (
      lowerUserInput.includes("نعم") ||
      lowerUserInput.includes("yes") ||
      lowerUserInput.includes("تأكيد") ||
      lowerUserInput.includes("confirm")
    ) {
      try {
        await cancelBooking(userState.data.secretCode)
        userState.stage = "cancellation_confirmed"
      } catch (error) {
        console.error("Error cancelling booking:", error)
        userState.stage = "cancellation_error"
      }
    } else if (
      lowerUserInput.includes("لا") ||
      lowerUserInput.includes("no") ||
      lowerUserInput.includes("إلغاء") ||
      lowerUserInput.includes("cancel")
    ) {
      userState.stage = "cancellation_aborted"
    }
    return
  }

  // Reset conversation if needed
  if (lowerUserInput.includes("بداية") || lowerUserInput.includes("start over") || lowerUserInput.includes("restart")) {
    userState.stage = "initial"
    userState.data = {}
  }
}

// Database helper functions
async function checkDateAvailability(date: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT COUNT(*) as count 
      FROM bookings 
      WHERE booking_date = ${date} 
      AND status = 'confirmed'
    `

    return Number.parseInt(result[0].count) === 0
  } catch (error) {
    console.error("Error checking date availability:", error)
    return false
  }
}

async function createBooking(
  customerName: string,
  customerPhone: string,
  bookingDate: string,
): Promise<{ bookingId: number; bookingReference: string; secretCode: string }> {
  // Generate a unique booking reference (4 digits)
  const bookingReference = Math.floor(1000 + Math.random() * 9000).toString()

  // Generate a secret code for managing the booking
  const secretCode = Math.floor(100000 + Math.random() * 900000).toString()

  const result = await sql`
    INSERT INTO bookings (
      booking_reference, 
      customer_name, 
      customer_phone, 
      booking_date, 
      price, 
      status, 
      secret_code
    ) 
    VALUES (
      ${bookingReference}, 
      ${customerName}, 
      ${customerPhone}, 
      ${bookingDate}, 
      250, 
      'pending', 
      ${secretCode}
    )
    RETURNING id
  `

  return {
    bookingId: result[0].id,
    bookingReference,
    secretCode,
  }
}

async function createVerificationCode(bookingId: number): Promise<string> {
  // Generate a 4-digit OTP code
  const otpCode = Math.floor(1000 + Math.random() * 9000).toString()

  // Set expiration time (30 minutes from now)
  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + 30)

  await sql`
    INSERT INTO verification_codes (
      booking_id, 
      otp_code, 
      expires_at
    ) 
    VALUES (
      ${bookingId}, 
      ${otpCode}, 
      ${expiresAt.toISOString()}
    )
  `

  return otpCode
}

async function confirmBooking(bookingId: number): Promise<void> {
  await sql`
    UPDATE bookings 
    SET status = 'confirmed' 
    WHERE id = ${bookingId}
  `
}

async function getBookingBySecretCode(secretCode: string) {
  const result = await sql`
    SELECT * FROM bookings WHERE secret_code = ${secretCode}
  `

  return result.length > 0 ? result[0] : null
}

async function cancelBooking(secretCode: string): Promise<boolean> {
  const result = await sql`
    UPDATE bookings 
    SET status = 'cancelled' 
    WHERE secret_code = ${secretCode} 
    AND status = 'confirmed'
  `

  return result.count > 0
}
