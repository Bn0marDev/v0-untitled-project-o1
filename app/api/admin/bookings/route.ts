import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    // Check if admin is logged in
    const cookieStore = cookies()
    const isLoggedIn = cookieStore.has("admin_session")

    if (!isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch all bookings
    const bookings = await sql`
      SELECT * FROM bookings
      ORDER BY created_at DESC
    `

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}
