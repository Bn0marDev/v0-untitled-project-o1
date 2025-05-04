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
      from: "استراحة السلام <onboarding@resend.dev>",
      to: email,
      subject: `رمز التحقق لحجز استراحة السلام - ${bookingReference}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #2e7d32; margin-bottom: 5px;">استراحة السلام</h1>
            <p style="color: #666; font-size: 14px;">نظام الحجز الإلكتروني</p>
          </div>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #2e7d32; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">مرحباً ${customerName}،</h2>
            
            <p>شكراً لاختيارك استراحة السلام. نحن بحاجة إلى تأكيد حجزك.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">تفاصيل الحجز:</h3>
              <ul style="padding-right: 20px;">
                <li>رقم الحجز: <strong>${bookingReference}</strong></li>
                <li>تاريخ الحجز: <strong>${formattedDate}</strong></li>
                <li>السعر: <strong>250 د.ل</strong></li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="font-size: 16px; margin-bottom: 10px;">رمز التحقق الخاص بك هو:</p>
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2e7d32; background-color: #e8f5e9; padding: 15px; border-radius: 8px; display: inline-block;">${otpCode}</div>
              <p style="font-size: 14px; color: #666; margin-top: 10px;">يرجى إدخال هذا الرمز في نافذة المحادثة لتأكيد حجزك.</p>
              <p style="font-size: 12px; color: #f44336;">ينتهي صلاحية هذا الرمز خلال 30 دقيقة.</p>
            </div>
          </div>
          
          <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>إذا لم تقم بطلب هذا الحجز، يرجى تجاهل هذا البريد الإلكتروني.</p>
            <p>مع تحيات،<br>فريق استراحة السلام</p>
          </div>
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
      from: "استراحة السلام <onboarding@resend.dev>",
      to: email,
      subject: `تأكيد حجز استراحة السلام - ${bookingReference}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #2e7d32; margin-bottom: 5px;">استراحة السلام</h1>
            <p style="color: #666; font-size: 14px;">نظام الحجز الإلكتروني</p>
          </div>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #2e7d32; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">مرحباً ${customerName}،</h2>
            
            <p style="font-size: 18px; color: #2e7d32; font-weight: bold;">تم تأكيد حجزك في استراحة السلام بنجاح! 🎉</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">تفاصيل الحجز:</h3>
              <ul style="padding-right: 20px;">
                <li>رقم الحجز: <strong>${bookingReference}</strong></li>
                <li>تاريخ الحجز: <strong>${formattedDate}</strong></li>
                <li>السعر: <strong>250 د.ل</strong></li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0; padding: 20px; border: 2px dashed #2e7d32; border-radius: 8px;">
              <p style="font-size: 16px; margin-bottom: 10px;">الرمز السري لإدارة حجزك هو:</p>
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2e7d32; background-color: #e8f5e9; padding: 15px; border-radius: 8px; display: inline-block;">${secretCode}</div>
              <p style="font-size: 14px; color: #666; margin-top: 10px;">احتفظ بهذا الرمز للاستعلام عن حجزك أو إلغائه أو تمديده.</p>
            </div>
            
            <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <h3 style="margin-top: 0; color: #2e7d32;">تعليمات مهمة:</h3>
              <ul style="padding-right: 20px;">
                <li>يرجى الوصول قبل 15 دقيقة من موعد الحجز</li>
                <li>إحضار بطاقة الهوية الشخصية</li>
                <li>في حالة الرغبة في إلغاء الحجز، يرجى إخطارنا قبل 24 ساعة على الأقل</li>
              </ul>
            </div>
          </div>
          
          <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>نتطلع لاستقبالك في استراحة السلام!</p>
            <p>للاستفسارات: <a href="tel:+218123456789" style="color: #2e7d32;">+218 12-345-6789</a></p>
            <p>مع تحيات،<br>فريق استراحة السلام</p>
          </div>
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

export async function sendCancellationEmail(
  email: string,
  customerName: string,
  bookingDate: string,
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
      from: "استراحة السلام <onboarding@resend.dev>",
      to: email,
      subject: `إلغاء حجز استراحة السلام - ${bookingReference}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #2e7d32; margin-bottom: 5px;">استراحة السلام</h1>
            <p style="color: #666; font-size: 14px;">نظام الحجز الإلكتروني</p>
          </div>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #2e7d32; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">مرحباً ${customerName}،</h2>
            
            <p style="font-size: 18px; color: #d32f2f; font-weight: bold;">تم إلغاء حجزك في استراحة السلام</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">تفاصيل الحجز الملغي:</h3>
              <ul style="padding-right: 20px;">
                <li>رقم الحجز: <strong>${bookingReference}</strong></li>
                <li>تاريخ الحجز: <strong>${formattedDate}</strong></li>
              </ul>
            </div>
            
            <p>تم إلغاء حجزك بناءً على طلبك. نأمل أن نراك مرة أخرى في استراحة السلام.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://mousa.org.ly" style="background-color: #2e7d32; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">حجز جديد</a>
            </div>
          </div>
          
          <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>إذا كان لديك أي استفسارات، يرجى التواصل معنا.</p>
            <p>للاستفسارات: <a href="tel:+218123456789" style="color: #2e7d32;">+218 12-345-6789</a></p>
            <p>مع تحيات،<br>فريق استراحة السلام</p>
          </div>
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
