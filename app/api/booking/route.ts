import { type NextRequest, NextResponse } from "next/server"
import { createBooking, createVerificationCode, checkDateAvailability } from "@/lib/db"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const { customerName, customerPhone, customerEmail, bookingDate } = await req.json()

    // Validate required fields
    if (!customerName || !customerPhone || !customerEmail || !bookingDate) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Check if date is available
    const isAvailable = await checkDateAvailability(bookingDate)

    if (!isAvailable) {
      return NextResponse.json({ error: "Selected date is not available" }, { status: 400 })
    }

    // Create booking
    const { bookingId, bookingReference, secretCode } = await createBooking(customerName, customerPhone, bookingDate)

    // Generate OTP code
    const otpCode = await createVerificationCode(bookingId)

    // Send verification email - if it fails, we'll still continue with the booking process
    try {
      await sendVerificationEmail(customerEmail, customerName, bookingDate, otpCode, bookingReference)
    } catch (emailError) {
      console.error("Error sending verification email:", emailError)
      // Continue with the process even if email fails
    }

    return NextResponse.json({
      success: true,
      bookingReference,
      otpCode, // Include OTP in response for testing purposes
      message: "Verification code sent to email",
    })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}
