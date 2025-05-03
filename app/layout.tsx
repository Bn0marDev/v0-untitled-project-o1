import type React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "استراحة السلام - نظام الحجز الذكي في ليبيا",
  description: "احجز استراحة السلام بسهولة وسرعة باستخدام نظام Qrok Cloud. نظام حجز إلكتروني آمن ومريح في ليبيا.",
  keywords: ["استراحة", "حجز استراحة", "ليبيا", "نظام حجز", "Qrok", "استراحة السلام"],
  authors: [{ name: "mousa.org.ly", url: "https://mousa.org.ly" }],
  creator: "Bn0marDev",
  publisher: "mousa.org.ly",
  metadataBase: new URL("https://mousa.org.ly"),
  generator: "Next.js & v0.dev"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
