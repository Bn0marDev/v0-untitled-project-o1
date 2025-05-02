import { type NextRequest, NextResponse } from "next/server"

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

    // Generate mock data for testing
    const mockData = generateMockAvailabilityData(startDate, endDate)

    console.log("Returning mock availability data")
    return NextResponse.json({ dates: mockData })

    // Uncomment this when database is working properly
    // const availableDates = await getAvailableDates(startDate, endDate)
    // return NextResponse.json({ dates: availableDates || [] })
  } catch (error) {
    console.error("Error in availability API:", error)
    // Always return a valid JSON response even on error
    return NextResponse.json({
      error: "Failed to fetch availability",
      dates: [],
    })
  }
}

// Helper function to generate mock availability data for testing
function generateMockAvailabilityData(startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const result = []

  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dateString = date.toISOString().split("T")[0]

    // Make some random dates unavailable (for testing)
    const isAvailable = Math.random() > 0.2 // 20% chance of being unavailable

    result.push({
      date: dateString,
      available: isAvailable,
    })
  }

  return result
}
