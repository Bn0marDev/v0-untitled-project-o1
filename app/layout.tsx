import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "استراحة السلام - نظام الحجز الذكي المتطور في ليبيا",
  description: "استمتع بتجربة حجز استراحة السلام باستخدام نظام الحجز الذكي، الذي يوفر لك سهولة وأمان في اختيار مواعيد الحجز.",
  keywords: ["استراحة السلام", "نظام الحجز الذكي", "حجز استراحة", "حجز في ليبيا", "نظام حجز ذكي"],
  generator: 'mousa0mar'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
