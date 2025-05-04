import { type NextRequest, NextResponse } from "next/server"
import { getAvailableDates } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")

    console.log("Availability API called with:", { startDate, endDate })

    if (!startDate || !endDate) {
      console.log("Missing start_date or end_date parameters")
      return NextResponse.json({
        error: "Start date and end date are required",
        dates: [],
      })
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      console.log("Invalid date format")
      return NextResponse.json({
        error: "Invalid date format. Use YYYY-MM-DD",
        dates: [],
      })
    }

    // Get available dates from the database
    const availableDates = await getAvailableDates(startDate, endDate)

    console.log(`Returning ${availableDates.length} dates from database`)
    return NextResponse.json({ dates: availableDates || [] })
  } catch (error) {
    console.error("Error in availability API:", error)
    // Always return a valid JSON response even on error
    return NextResponse.json({
      error: "Failed to fetch availability",
      dates: [],
    })
  }
}
