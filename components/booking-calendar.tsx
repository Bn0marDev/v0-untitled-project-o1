"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

type BookingFormData = {
  customerName: string
  customerPhone: string
  customerEmail: string
  bookingDate: string
}

type VerificationData = {
  bookingReference: string
  otpCode: string
}

export function BookingCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [availableDates, setAvailableDates] = useState<{ date: string; available: boolean }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false)
  const [calendarError, setCalendarError] = useState<string | null>(null)
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false)
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState<BookingFormData>({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    bookingDate: "",
  })

  const [verificationData, setVerificationData] = useState<VerificationData>({
    bookingReference: "",
    otpCode: "",
  })

  const [secretCode, setSecretCode] = useState<string | null>(null)

  useEffect(() => {
    // Fetch available dates for the current month
    const fetchAvailableDates = async () => {
      if (!date) return

      setIsLoadingCalendar(true)
      setCalendarError(null)

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
        setCalendarError((error as Error).message)
        // Set default - all dates available
        setAvailableDates([])
      } finally {
        setIsLoadingCalendar(false)
      }
    }

    fetchAvailableDates()
  }, [date])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return

    setDate(selectedDate)

    // Check if date is available - default to available if we don't have data
    const dateString = selectedDate.toISOString().split("T")[0]
    const dateInfo = availableDates.find((d) => d.date === dateString)
    const isAvailable = dateInfo ? dateInfo.available : true

    if (isAvailable) {
      setFormData((prev) => ({
        ...prev,
        bookingDate: dateString,
      }))
      setBookingDialogOpen(true)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleVerificationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setVerificationData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create booking")
      }

      const data = await response.json()

      // Set booking reference for verification
      setVerificationData((prev) => ({
        ...prev,
        bookingReference: data.bookingReference,
      }))

      // For development/testing, show the OTP in the UI if email sending failed
      if (data.otpCode) {
        setErrorMessage(`ملاحظة: رمز التحقق للاختبار هو: ${data.otpCode}`)
      }

      // Close booking dialog and open verification dialog
      setBookingDialogOpen(false)
      setVerificationDialogOpen(true)
    } catch (error) {
      console.error("Error creating booking:", error)
      setErrorMessage((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ...verificationData,
          email: formData.customerEmail,
          customerName: formData.customerName,
          bookingDate: formData.bookingDate,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to verify booking")
      }

      const data = await response.json()

      // Store secret code
      setSecretCode(data.secretCode)

      // Close verification dialog and open success dialog
      setVerificationDialogOpen(false)
      setSuccessDialogOpen(true)

      // Refresh available dates
      const newDate = new Date(date!)
      setDate(new Date(newDate.setDate(newDate.getDate() + 1)))
      setDate(newDate)
    } catch (error) {
      console.error("Error verifying booking:", error)
      setErrorMessage((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const isDateUnavailable = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    const dateInfo = availableDates.find((d) => d.date === dateString)

    // If we don't have info about this date, assume it's available
    return dateInfo ? !dateInfo.available : false
  }

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="text-center mb-4">
            <p className="text-gray-600" dir="rtl">
              اختر تاريخاً للحجز
            </p>
          </div>
          {isLoadingCalendar ? (
            <div className="flex justify-center items-center h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : (
            <>
              {calendarError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>حدث خطأ أثناء تحميل التقويم. جميع التواريخ متاحة للحجز.</AlertDescription>
                </Alert>
              )}
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                disabled={[{ before: new Date() }, isDateUnavailable]}
                className="rounded-md border"
              />
            </>
          )}
          <div className="mt-4 flex justify-center space-x-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm">متاح</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-300 rounded-full mr-2"></div>
              <span className="text-sm">غير متاح</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">حجز استراحة السلام</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleBookingSubmit}>
            <div className="space-y-4 py-4" dir="rtl">
              <div className="space-y-2">
                <Label htmlFor="bookingDate">تاريخ الحجز</Label>
                <Input id="bookingDate" value={formData.bookingDate} readOnly className="text-right" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerName">الاسم الكامل</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone">رقم الهاتف</Label>
                <Input
                  id="customerPhone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  required
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerEmail">البريد الإلكتروني</Label>
                <Input
                  id="customerEmail"
                  name="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  required
                  className="text-right"
                />
              </div>

              <div className="text-center font-bold">
                <p>سعر الحجز: 250 د.ل</p>
              </div>

              {errorMessage && (
                <Alert variant="destructive">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  "تأكيد الحجز"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Verification Dialog */}
      <Dialog open={verificationDialogOpen} onOpenChange={setVerificationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">تأكيد الحجز</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleVerificationSubmit}>
            <div className="space-y-4 py-4" dir="rtl">
              <p className="text-center">
                تم إرسال رمز التحقق إلى بريدك الإلكتروني. يرجى إدخال الرمز المكون من 4 أرقام لتأكيد حجزك.
              </p>

              <div className="space-y-2">
                <Label htmlFor="otpCode">رمز التحقق</Label>
                <Input
                  id="otpCode"
                  name="otpCode"
                  value={verificationData.otpCode}
                  onChange={handleVerificationInputChange}
                  required
                  className="text-center text-2xl tracking-widest"
                  maxLength={4}
                />
              </div>

              {errorMessage && (
                <Alert variant="destructive">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري التحقق...
                  </>
                ) : (
                  "تأكيد"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-green-600">تم تأكيد الحجز بنجاح!</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4" dir="rtl">
            <p className="text-center">تم تأكيد حجزك في استراحة السلام بنجاح!</p>

            <div className="bg-gray-100 p-4 rounded-md">
              <p className="font-bold">تفاصيل الحجز:</p>
              <p>التاريخ: {formData.bookingDate}</p>
              <p>رقم الحجز: {verificationData.bookingReference}</p>
              <p>السعر: 250 د.ل</p>
            </div>

            <div className="bg-green-100 p-4 rounded-md">
              <p className="font-bold">الرمز السري الخاص بك:</p>
              <p className="text-center text-2xl font-bold">{secretCode}</p>
              <p className="text-sm text-gray-600">احتفظ بهذا الرمز للاستعلام عن حجزك أو إلغائه أو تمديده.</p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setSuccessDialogOpen(false)} className="w-full">
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
