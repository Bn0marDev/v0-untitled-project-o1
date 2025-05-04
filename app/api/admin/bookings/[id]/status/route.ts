import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if admin is logged in
    const cookieStore = cookies()
    const isLoggedIn = cookieStore.has("admin_session")

    if (!isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bookingId = params.id
    const { status } = await req.json()

    // Validate status
    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Update booking status
    await sql`
      UPDATE bookings
      SET status = ${status}
      WHERE id = ${bookingId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating booking status:", error)
    return NextResponse.json({ error: "Failed to update booking status" }, { status: 500 })
  }
}
