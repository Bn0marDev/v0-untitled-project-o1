"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type CalendarViewProps = {
  bookings: any[]
}

export function CalendarView({ bookings }: CalendarViewProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Get bookings for the selected date
  const selectedDateStr = selectedDate ? selectedDate.toISOString().split("T")[0] : null
  const bookingsForSelectedDate = selectedDate
    ? bookings.filter((booking) => booking.booking_date.split("T")[0] === selectedDateStr)
    : []

  // Create a map of dates with bookings
  const bookingDates = bookings.reduce((acc: Record<string, any[]>, booking) => {
    const dateStr = booking.booking_date.split("T")[0]
    if (!acc[dateStr]) {
      acc[dateStr] = []
    }
    acc[dateStr].push(booking)
    return acc
  }, {})

  // Custom day render function
  const renderDay = (day: Date) => {
    const dateStr = day.toISOString().split("T")[0]
    const hasBookings = bookingDates[dateStr] && bookingDates[dateStr].length > 0
    const confirmedBookings = hasBookings
      ? bookingDates[dateStr].filter((b: any) => b.status === "confirmed").length
      : 0

    return (
      <div className="relative">
        <div>{day.getDate()}</div>
        {hasBookings && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center">
            <Badge
              className={`text-[10px] h-2 w-2 p-0 rounded-full ${
                confirmedBookings > 0 ? "bg-green-500" : "bg-yellow-500"
              }`}
            />
          </div>
        )}
      </div>
    )
  }

  const handleDateSelect = (date: Date | undefined) => {
    setDate(date)
    setSelectedDate(date || null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">مؤكد</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">قيد الانتظار</Badge>
      case "cancelled":
        return <Badge className="bg-red-500">ملغي</Badge>
      default:
        return <Badge className="bg-gray-500">{status}</Badge>
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          className="rounded-md border"
          components={{
            Day: ({ day, ...props }) => (
              <button {...props} className={props.className}>
                {renderDay(day)}
              </button>
            ),
          }}
        />
      </div>

      <div>
        <Card>
          <CardContent className="p-4">
            {selectedDate ? (
              <div dir="rtl">
                <h3 className="font-bold mb-4">
                  حجوزات يوم{" "}
                  {selectedDate.toLocaleDateString("ar-LY", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>

                {bookingsForSelectedDate.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">لا توجد حجوزات في هذا اليوم</p>
                ) : (
                  <div className="space-y-4">
                    {bookingsForSelectedDate.map((booking) => (
                      <div key={booking.id} className="border rounded-md p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{booking.customer_name}</span>
                          {getStatusBadge(booking.status)}
                        </div>
                        <div className="text-sm text-gray-500">
                          <p>رقم الحجز: {booking.booking_reference}</p>
                          <p>رقم الهاتف: {booking.customer_phone}</p>
                          <p>السعر: {booking.price} د.ل</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8" dir="rtl">
                اختر يوماً لعرض الحجوزات
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
