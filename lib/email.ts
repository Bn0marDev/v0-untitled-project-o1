import { Resend } from "resend"

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(
  email: string,
  customerName: string,
  bookingDate: string,
  otpCode: string,
  bookingReference: string,
) {
  try {
    const formattedDate = new Date(bookingDate).toLocaleDateString("ar-LY", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const { data, error } = await resend.emails.send({
      from: "حجوزات السلام <noreply@mousa.org.ly>",
      to: email,
      subject: `تأكيد حجز استراحة السلام - ${bookingReference}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>مرحباً ${customerName}،</h2>
          <p>شكراً لاختيارك استراحة السلام.</p>
          <p>تفاصيل حجزك:</p>
          <ul>
            <li>رقم الحجز: <strong>${bookingReference}</strong></li>
            <li>تاريخ الحجز: <strong>${formattedDate}</strong></li>
            <li>السعر: <strong>250 د.ل</strong></li>
          </ul>
          <p>رمز التحقق الخاص بك هو: <strong style="font-size: 24px;">${otpCode}</strong></p>
          <p>يرجى إدخال هذا الرمز لتأكيد حجزك.</p>
          <p>ينتهي صلاحية هذا الرمز خلال 30 دقيقة.</p>
          <p>مع تحيات،<br>فريق استراحة السلام</p>
        </div>
      `,
    })

    if (error) {
      console.error("Error sending email:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}

export async function sendBookingConfirmationEmail(
  email: string,
  customerName: string,
  bookingDate: string,
  bookingReference: string,
  secretCode: string,
) {
  try {
    const formattedDate = new Date(bookingDate).toLocaleDateString("ar-LY", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const { data, error } = await resend.emails.send({
      from: "حجوزات السلام <noreply@mousa.org.ly>",
      to: email,
      subject: `تم تأكيد حجزك في استراحة السلام - ${bookingReference}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>مرحباً ${customerName}،</h2>
          <p>تم تأكيد حجزك في استراحة السلام بنجاح!</p>
          <p>تفاصيل حجزك:</p>
          <ul>
            <li>رقم الحجز: <strong>${bookingReference}</strong></li>
            <li>تاريخ الحجز: <strong>${formattedDate}</strong></li>
            <li>السعر: <strong>250 د.ل</strong></li>
          </ul>
          <p>الرمز السري لإدارة حجزك هو: <strong style="font-size: 24px;">${secretCode}</strong></p>
          <p>احتفظ بهذا الرمز للاستعلام عن حجزك أو إلغائه أو تمديده.</p>
          <p>نتطلع لاستقبالك في استراحة السلام!</p>
          <p>مع تحيات،<br>فريق استراحة السلام</p>
        </div>
      `,
    })

    if (error) {
      console.error("Error sending email:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}
