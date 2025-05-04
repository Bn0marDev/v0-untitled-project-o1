import { ChatInterface } from "@/components/chat-interface-modern"
import { AvailabilityCalendar } from "@/components/availability-calendar"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "المساعد الذكي - استراحة السلام",
  description: "تحدث مع المساعد الذكي لحجز استراحة السلام بسهولة وسرعة",
}

export default function ChatPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex items-center justify-between w-full">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                العودة للرئيسية
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">اس</span>
              </div>
              <span className="font-heading font-bold">استراحة السلام</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar on the right for desktop, top for mobile */}
          <div className="lg:order-2 lg:col-span-1">
            <AvailabilityCalendar />
          </div>

          {/* Chat interface on the left for desktop, bottom for mobile */}
          <div className="lg:order-1 lg:col-span-2">
            <ChatInterface />
          </div>
        </div>
      </main>

      <footer className="border-t py-4">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-10 md:flex-row">
          <p className="text-xs text-muted-foreground text-center md:text-right">
            &copy; 2023 استراحة السلام. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  )
}
