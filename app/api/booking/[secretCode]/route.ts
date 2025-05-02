import { type NextRequest, NextResponse } from "next/server"
import { getBookingBySecretCode, cancelBooking } from "@/lib/db"

export async function GET(req: NextRequest, { params }: { params: { secretCode: string } }) {
  try {
    const secretCode = params.secretCode

    if (!secretCode) {
      return NextResponse.json({ error: "Secret code is required" }, { status: 400 })
    }

    const booking = await getBookingBySecretCode(secretCode)

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Calculate days remaining
    const bookingDate = new Date(booking.booking_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const daysRemaining = Math.ceil((bookingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    return NextResponse.json({
      booking: {
        reference: booking.booking_reference,
        date: booking.booking_date,
        status: booking.status,
        customerName: booking.customer_name,
        daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
      },
    })
  } catch (error) {
    console.error("Error fetching booking:", error)
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { secretCode: string } }) {
  try {
    const secretCode = params.secretCode

    if (!secretCode) {
      return NextResponse.json({ error: "Secret code is required" }, { status: 400 })
    }

    const isCancelled = await cancelBooking(secretCode)

    if (!isCancelled) {
      return NextResponse.json({ error: "Failed to cancel booking or booking not found" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully",
    })
  } catch (error) {
    console.error("Error cancelling booking:", error)
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 })
  }
}
