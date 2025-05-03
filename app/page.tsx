import { ChatInterface } from "@/components/chat-interface"
import { BookingCalendar } from "@/components/booking-calendar"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8 text-green-800">استراحة السلام</h1>
        <p className="text-xl text-center mb-12 text-gray-700" dir="rtl">
          نظام الحجز الذكي باستخدام  بستخدام نظامنا الذكي
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-center">تحدث مع المساعد الذكي</h2>
            <ChatInterface />
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-center">تقويم الحجوزات</h2>
            <BookingCalendar />
          </div>
        </div>
      </div>
    </main>
  )
}
