"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Loader2, Search, Calendar, User } from "lucide-react"

type BookingDetails = {
  reference: string
  date: string
  status: string
  customerName: string
  daysRemaining: number
}

export function BookingManagement() {
  const [secretCode, setSecretCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!secretCode.trim()) return

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await fetch(`/api/booking/${secretCode}`)

      if (!response.ok) {
        throw new Error("لم يتم العثور على حجز بهذا الرمز")
      }

      const data = await response.json()
      setBooking(data.booking)
    } catch (error) {
      console.error("Error fetching booking:", error)
      setErrorMessage((error as Error).message)
      setBooking(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelBooking = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/booking/${secretCode}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("فشل في إلغاء الحجز")
      }

      // Update booking status
      if (booking) {
        setBooking({
          ...booking,
          status: "cancelled",
        })
      }

      setConfirmDialogOpen(false)
    } catch (error) {
      console.error("Error cancelling booking:", error)
      setErrorMessage((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ar-LY", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-center">إدارة الحجز</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                placeholder="أدخل الرمز السري للحجز"
                className="flex-1 text-right"
                dir="rtl"
              />
              <Button type="submit" size="icon" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>

            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
          </form>

          {booking && (
            <div className="mt-6 space-y-4" dir="rtl">
              <div className="bg-gray-100 p-4 rounded-md">
                <h3 className="font-bold text-lg mb-2">تفاصيل الحجز</h3>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    <p>التاريخ: {formatDate(booking.date)}</p>
                  </div>

                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    <p>الاسم: {booking.customerName}</p>
                  </div>

                  <div className="flex items-center">
                    <div className="h-5 w-5 mr-2 flex items-center justify-center">
                      <span className="font-bold">#</span>
                    </div>
                    <p>رقم الحجز: {booking.reference}</p>
                  </div>

                  <div>
                    <p>
                      الحالة:{" "}
                      <span
                        className={`font-bold ${
                          booking.status === "confirmed"
                            ? "text-green-600"
                            : booking.status === "cancelled"
                              ? "text-red-600"
                              : "text-yellow-600"
                        }`}
                      >
                        {booking.status === "confirmed"
                          ? "مؤكد"
                          : booking.status === "cancelled"
                            ? "ملغي"
                            : "في الانتظار"}
                      </span>
                    </p>
                  </div>

                  {booking.status === "confirmed" && (
                    <div>
                      <p>
                        {booking.daysRemaining > 0
                          ? `متبقي ${booking.daysRemaining} يوم على موعد حجزك`
                          : "حجزك هو اليوم!"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>

        {booking && booking.status === "confirmed" && (
          <CardFooter>
            <Button variant="destructive" className="w-full" onClick={() => setConfirmDialogOpen(true)}>
              إلغاء الحجز
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">تأكيد إلغاء الحجز</DialogTitle>
          </DialogHeader>

          <div className="py-4" dir="rtl">
            <p className="text-center">هل أنت متأكد من رغبتك في إلغاء هذا الحجز؟</p>
            <p className="text-center text-gray-600">لا يمكن التراجع عن هذا الإجراء.</p>
          </div>

          <DialogFooter className="flex space-x-2">
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)} className="flex-1">
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleCancelBooking} disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الإلغاء...
                </>
              ) : (
                "تأكيد الإلغاء"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
