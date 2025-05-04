import { ChatInterface } from "@/components/chat-interface"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "استراحة السلام - نظام الحجز الذكي",
  description: "احجز استراحة السلام بسهولة من خلال نظام الحجز الذكي المدعوم بتقنية الذكاء الاصطناعي",
  keywords: "استراحة السلام, حجز استراحة, استراحة في ليبيا, حجز اونلاين, ذكاء اصطناعي, حجز فوري",
  authors: [{ name: "فريق استراحة السلام" }],
  openGraph: {
    title: "استراحة السلام - نظام الحجز الذكي",
    description: "احجز استراحة السلام بسهولة من خلال نظام الحجز الذكي المدعوم بتقنية الذكاء الاصطناعي",
    images: [{ url: "/images/rest-house.jpg" }],
    locale: "ar_LY",
    type: "website",
  },
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-green-800 animate-fade-in">استراحة السلام</h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-2xl mx-auto" dir="rtl">
            نظام الحجز الذكي المدعوم بتقنية الذكاء الاصطناعي
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <ChatInterface />
        </div>

        <div className="mt-12 text-center text-gray-600 text-sm">
          <p dir="rtl">© 2023 استراحة السلام - جميع الحقوق محفوظة</p>
        </div>
      </div>
    </main>
  )
}
