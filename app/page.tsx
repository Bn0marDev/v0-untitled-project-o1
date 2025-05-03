import { ChatInterface } from "@/components/chat-interface"
import { BookingCalendar } from "@/components/booking-calendar"

// إضافة البيانات الخاصة بـ SEO
export const metadata = {
  title: "استراحة السلام - نظام الحجز الذكي في ليبيا",
  description: "احجز استراحتك الآن باستخدام نظام الحجز الذكي عبر Qrok Cloud. تجربة سهلة وآمنة للحجوزات في ليبيا.",
  keywords: ["حجز استراحة", "نظام حجز", "استراحة السلام", "حجز ليبيا", "Qrok Cloud", "حجز ذكي"],
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8 text-green-800">استراحة السلام</h1>
        <p className="text-xl text-center mb-12 text-gray-700" dir="rtl">
          نظام الحجز الذكي باستخدام Qrok Cloud
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
