import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Tajawal, Cairo } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeSwitcher } from "@/components/theme-switcher"

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
})

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
  variable: "--font-cairo",
})

export const metadata: Metadata = {
  title: "استراحة السلام - نظام الحجز الذكي",
  description: "نظام حجز ذكي لاستراحة السلام باستخدام الذكاء الاصطناعي",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${tajawal.variable} ${cairo.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <div className="relative min-h-screen">
            {children}
            <div className="fixed bottom-4 left-4 z-50">
              <ThemeSwitcher />
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
