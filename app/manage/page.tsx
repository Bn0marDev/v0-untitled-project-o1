import { BookingManagement } from "@/components/booking-management"

export default function ManagePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8 text-green-800">استراحة السلام</h1>
        <p className="text-xl text-center mb-12 text-gray-700" dir="rtl">
          إدارة الحجوزات
        </p>

        <div className="max-w-md mx-auto">
          <BookingManagement />
        </div>
      </div>
    </main>
  )
}
