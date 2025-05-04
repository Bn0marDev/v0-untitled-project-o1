import { AdminDashboard } from "@/components/admin/dashboard"
import { AdminLogin } from "@/components/admin/login"
import { cookies } from "next/headers"

export const metadata = {
  title: "لوحة تحكم استراحة السلام - إدارة الحجوزات",
  description: "لوحة تحكم لإدارة حجوزات استراحة السلام ومتابعة الإحصائيات",
  robots: "noindex, nofollow", // Don't index admin pages
}

export default function AdminPage() {
  // Check if admin is logged in
  const cookieStore = cookies()
  const isLoggedIn = cookieStore.has("admin_session")

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 bg-gray-50">
      <div className="z-10 w-full max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-green-800">لوحة تحكم استراحة السلام</h1>
          <p className="text-gray-600" dir="rtl">
            إدارة الحجوزات والمعلومات
          </p>
        </div>

        {isLoggedIn ? <AdminDashboard /> : <AdminLogin />}
      </div>
    </main>
  )
}
