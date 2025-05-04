import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if admin is logged in
    const cookieStore = cookies()
    const isLoggedIn = cookieStore.has("admin_session")

    if (!isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bookingId = params.id

    // Delete booking
    await sql`
      DELETE FROM bookings
      WHERE id = ${bookingId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting booking:", error)
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 })
  }
}
