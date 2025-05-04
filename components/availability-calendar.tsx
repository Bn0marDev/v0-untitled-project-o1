"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

type AvailabilityCalendarProps = {
  onDateSelect?: (date: Date) => void
}

type DateAvailability = {
  date: string
  available: boolean
}

export function AvailabilityCalendar({ onDateSelect }: AvailabilityCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [availableDates, setAvailableDates] = useState<DateAvailability[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch available dates for the current month
    const fetchAvailableDates = async () => {
      if (!date) return

      setIsLoading(true)
      setError(null)

      try {
        const startDate = new Date(date.getFullYear(), date.getMonth(), 1)
        const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)

        const startDateStr = startDate.toISOString().split("T")[0]
        const endDateStr = endDate.toISOString().split("T")[0]

        console.log("Fetching availability for:", { startDateStr, endDateStr })

        const response = await fetch(`/api/availability?start_date=${startDateStr}&end_date=${endDateStr}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        })

        // Check if response is ok before trying to parse JSON
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`)
        }

        // Parse JSON response
        const data = await response.json()
        console.log("Availability data received:", data)

        // Ensure we have an array of dates
        if (Array.isArray(data.dates)) {
          setAvailableDates(data.dates)
        } else {
          console.error("Invalid data format received:", data)
          setAvailableDates([])
        }
      } catch (error) {
        console.error("Error fetching availability:", error)
        setError((error as Error).message)
        // Set default - all dates available
        setAvailableDates([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAvailableDates()
  }, [date])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return

    // Check if date is available
    const dateString = selectedDate.toISOString().split("T")[0]
    const dateInfo = availableDates.find((d) => d.date === dateString)
    const isAvailable = dateInfo ? dateInfo.available : true

    if (isAvailable) {
      setDate(selectedDate)
      if (onDateSelect) {
        onDateSelect(selectedDate)
      }
    }
  }

  const isDateUnavailable = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    const dateInfo = availableDates.find((d) => d.date === dateString)

    // If we don't have info about this date, assume it's available
    return dateInfo ? !dateInfo.available : false
  }

  // Disable past dates
  const isPastDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center text-lg">التواريخ المتاحة</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              disabled={[isPastDate, isDateUnavailable]}
              className="rounded-md border"
            />
            <div className="mt-4 flex justify-center space-x-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-primary rounded-full mr-2"></div>
                <span className="text-sm">متاح</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-300 rounded-full mr-2"></div>
                <span className="text-sm">غير متاح</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
