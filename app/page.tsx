import { ChatInterface } from "@/components/chat-interface-fixed"

export const metadata = {
  title: "استراحة السلام - نظام الحجز الذكي",
  description: "احجز استراحة السلام بسهولة من خلال نظام الحجز الذكي المدعوم بتقنية Groq AI",
  keywords: "استراحة السلام, حجز استراحة, استراحة في ليبيا, حجز اونلاين, ذكاء اصطناعي",
  openGraph: {
    title: "استراحة السلام - نظام الحجز الذكي",
    description: "احجز استراحة السلام بسهولة من خلال نظام الحجز الذكي المدعوم بتقنية Groq AI",
    images: [{ url: "/images/rest-house.jpg" }],
  },
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24 bg-gradient-to-b from-green-50 to-white">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-green-800">استراحة السلام</h1>
          <p className="text-xl text-gray-700" dir="rtl">
            نظام الحجز الذكي المدعوم بتقنية Groq AI
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <ChatInterface />
        </div>
      </div>
    </main>
  )
}
