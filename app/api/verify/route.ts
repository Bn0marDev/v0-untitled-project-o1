import { type NextRequest, NextResponse } from "next/server"
import { verifyOTP } from "@/lib/db"
import { sendBookingConfirmationEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const { bookingReference, otpCode, email, customerName, bookingDate } = await req.json()

    if (!bookingReference || !otpCode) {
      return NextResponse.json({ error: "Booking reference and OTP code are required" }, { status: 400 })
    }

    // Verify OTP
    const isVerified = await verifyOTP(bookingReference, otpCode)

    if (!isVerified) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 })
    }

    // Get booking details to send confirmation email
    const booking = await getBookingByReference(bookingReference)

    if (booking && email) {
      // Send confirmation email with secret code
      await sendBookingConfirmationEmail(
        email,
        customerName || booking.customer_name,
        bookingDate || booking.booking_date,
        bookingReference,
        booking.secret_code,
      )
    }

    return NextResponse.json({
      success: true,
      message: "Booking confirmed successfully",
      secretCode: booking?.secret_code,
    })
  } catch (error) {
    console.error("Error verifying booking:", error)
    return NextResponse.json({ error: "Failed to verify booking" }, { status: 500 })
  }
}

// Helper function to get booking by reference
async function getBookingByReference(bookingReference: string) {
  const { sql } = await import("@/lib/db")

  const result = await sql`
    SELECT * FROM bookings WHERE booking_reference = ${bookingReference}
  `

  return result.length > 0 ? result[0] : null
}
