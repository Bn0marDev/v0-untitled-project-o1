"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookingsList } from "@/components/admin/bookings-list"
import { BookingStats } from "@/components/admin/booking-stats"
import { CalendarView } from "@/components/admin/calendar-view"
import { LogOutIcon as LogoutIcon, RefreshCw } from "lucide-react"

export function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [bookings, setBookings] = useState<any[]>([])
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    revenue: 0,
  })

  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/bookings")
      if (!response.ok) {
        throw new Error("Failed to fetch bookings")
      }
      const data = await response.json()
      setBookings(data.bookings)

      // Calculate stats
      const total = data.bookings.length
      const confirmed = data.bookings.filter((b: any) => b.status === "confirmed").length
      const pending = data.bookings.filter((b: any) => b.status === "pending").length
      const cancelled = data.bookings.filter((b: any) => b.status === "cancelled").length
      const revenue = data.bookings
        .filter((b: any) => b.status === "confirmed")
        .reduce((sum: number, b: any) => sum + Number.parseFloat(b.price), 0)

      setStats({
        total,
        confirmed,
        pending,
        cancelled,
        revenue,
      })
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()

    // Set up auto-refresh every 5 minutes
    const intervalId = setInterval(fetchBookings, 5 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      })
      window.location.reload()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={fetchBookings}>
          <RefreshCw className="h-4 w-4 mr-2" />
          تحديث
        </Button>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogoutIcon className="h-4 w-4 mr-2" />
          تسجيل الخروج
        </Button>
      </div>

      <BookingStats stats={stats} />

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">قائمة الحجوزات</TabsTrigger>
          <TabsTrigger value="calendar">التقويم</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>جميع الحجوزات</CardTitle>
            </CardHeader>
            <CardContent>
              <BookingsList bookings={bookings} isLoading={isLoading} onRefresh={fetchBookings} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>تقويم الحجوزات</CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarView bookings={bookings} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات النظام</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500" dir="rtl">
                إعدادات النظام قيد التطوير
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
