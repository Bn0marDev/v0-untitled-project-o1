"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2, Search, Eye, XCircle, CheckCircle } from "lucide-react"

type BookingsListProps = {
  bookings: any[]
  isLoading: boolean
  onRefresh: () => void
}

export function BookingsList({ bookings, isLoading, onRefresh }: BookingsListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.booking_reference.includes(searchTerm) ||
      booking.customer_phone.includes(searchTerm) ||
      booking.secret_code.includes(searchTerm),
  )

  const handleViewBooking = (booking: any) => {
    setSelectedBooking(booking)
    setIsDialogOpen(true)
  }

  const handleStatusChange = async (bookingId: number, newStatus: string) => {
    setIsActionLoading(true)
    setActionError(null)

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update booking status")
      }

      // Close dialog and refresh bookings
      setIsDialogOpen(false)
      onRefresh()
    } catch (error) {
      console.error("Error updating booking status:", error)
      setActionError((error as Error).message)
    } finally {
      setIsActionLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ar-LY", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
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
    <div className="space-y-4">
      <div className="flex items-center">
        <Search className="h-4 w-4 mr-2 text-gray-500" />
        <Input
          placeholder="بحث عن حجز..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-right"
          dir="rtl"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-8 text-gray-500" dir="rtl">
          لا توجد حجوزات مطابقة للبحث
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم الحجز</TableHead>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">السعر</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.booking_reference}</TableCell>
                  <TableCell>{booking.customer_name}</TableCell>
                  <TableCell>{formatDate(booking.booking_date)}</TableCell>
                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                  <TableCell>{booking.price} د.ل</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleViewBooking(booking)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Booking Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">تفاصيل الحجز</DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4" dir="rtl">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">رقم الحجز</p>
                  <p className="font-medium">{selectedBooking.booking_reference}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">الرمز السري</p>
                  <p className="font-medium">{selectedBooking.secret_code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">الاسم</p>
                  <p className="font-medium">{selectedBooking.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">رقم الهاتف</p>
                  <p className="font-medium">{selectedBooking.customer_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">تاريخ الحجز</p>
                  <p className="font-medium">{formatDate(selectedBooking.booking_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">السعر</p>
                  <p className="font-medium">{selectedBooking.price} د.ل</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">الحالة</p>
                  <p className="font-medium">{getStatusBadge(selectedBooking.status)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">تاريخ الإنشاء</p>
                  <p className="font-medium">{formatDate(selectedBooking.created_at)}</p>
                </div>
              </div>

              {actionError && (
                <Alert variant="destructive">
                  <AlertDescription>{actionError}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-between">
                {selectedBooking.status !== "confirmed" && (
                  <Button
                    onClick={() => handleStatusChange(selectedBooking.id, "confirmed")}
                    disabled={isActionLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isActionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    تأكيد الحجز
                  </Button>
                )}

                {selectedBooking.status !== "cancelled" && (
                  <Button
                    onClick={() => handleStatusChange(selectedBooking.id, "cancelled")}
                    disabled={isActionLoading}
                    variant="destructive"
                  >
                    {isActionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    إلغاء الحجز
                  </Button>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full">
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
