import { neon } from "@neondatabase/serverless"

// Initialize the database connection
export const sql = neon(process.env.DATABASE_URL!)

// Helper functions for database operations
export async function checkDateAvailability(date: string): Promise<boolean> {
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
    // Default to unavailable if there's an error
    return false
  }
}

export async function createBooking(
  customerName: string,
  customerPhone: string,
  bookingDate: string,
  price = 250,
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
      ${price}, 
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

export async function createVerificationCode(bookingId: number): Promise<string> {
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

export async function verifyOTP(bookingReference: string, otpCode: string): Promise<boolean> {
  const booking = await sql`
    SELECT id FROM bookings WHERE booking_reference = ${bookingReference} AND status = 'pending'
  `

  if (booking.length === 0) {
    return false
  }

  const bookingId = booking[0].id

  const verification = await sql`
    SELECT id FROM verification_codes 
    WHERE booking_id = ${bookingId} 
    AND otp_code = ${otpCode} 
    AND expires_at > NOW() 
    AND verified = false
  `

  if (verification.length === 0) {
    return false
  }

  // Mark OTP as verified
  await sql`
    UPDATE verification_codes 
    SET verified = true 
    WHERE id = ${verification[0].id}
  `

  // Update booking status to confirmed
  await sql`
    UPDATE bookings 
    SET status = 'confirmed' 
    WHERE id = ${bookingId}
  `

  return true
}

export async function getBookingBySecretCode(secretCode: string) {
  const result = await sql`
    SELECT * FROM bookings WHERE secret_code = ${secretCode}
  `

  return result.length > 0 ? result[0] : null
}

export async function cancelBooking(secretCode: string): Promise<boolean> {
  const result = await sql`
    UPDATE bookings 
    SET status = 'cancelled' 
    WHERE secret_code = ${secretCode} 
    AND status = 'confirmed'
  `

  return result.count > 0
}

// Simplified function to get available dates
export async function getAvailableDates(startDate: string, endDate: string) {
  try {
    // Generate all dates in the range
    const allDates = []
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Ensure end date is not before start date
    if (end < start) {
      return []
    }

    // Generate all dates in the range first
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateString = date.toISOString().split("T")[0]
      allDates.push({
        date: dateString,
        available: true, // Default to available
      })
    }

    // Then check for booked dates
    try {
      const bookedDates = await sql`
        SELECT booking_date::text as date 
        FROM bookings 
        WHERE status = 'confirmed'
      `

      // Mark booked dates as unavailable
      for (const booking of bookedDates) {
        if (booking.date) {
          const bookingDate = new Date(booking.date)
          const bookingDateStr = bookingDate.toISOString().split("T")[0]

          const dateEntry = allDates.find((d) => d.date === bookingDateStr)
          if (dateEntry) {
            dateEntry.available = false
          }
        }
      }
    } catch (error) {
      console.error("Error fetching booked dates:", error)
      // Continue with all dates marked as available
    }

    return allDates
  } catch (error) {
    console.error("Error getting available dates:", error)
    // Return empty array on error
    return []
  }
}
