import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(req: NextRequest) {
  try {
    const { message, userId, context } = await req.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Generate a unique user ID if not provided
    const userIdentifier = userId || "anonymous-user"

    // Generate response using Groq AI with server-side API key
    const response = await generateText({
      model: groq("llama3-70b-8192"),
      prompt: `
        أنت مساعد حجز ذكي لاستراحة السلام في ليبيا. تساعد العملاء في حجز الاستراحة والاستعلام عن الحجوزات وإلغائها.
        
        معلومات مهمة:
        - سعر الحجز هو 250 دينار ليبي لليوم الواحد
        - يجب جمع اسم العميل ورقم هاتفه وبريده الإلكتروني لإتمام الحجز
        - بعد تأكيد الحجز، يتم إرسال رمز تحقق من 4 أرقام عبر البريد الإلكتروني
        - بعد التحقق، يحصل العميل على رمز سري من 6 أرقام للاستعلام عن الحجز أو إلغائه
        
        سياق المحادثة الحالية:
        ${context || ""}
        
        رسالة المستخدم الأخيرة: ${message}
        
        أجب بشكل مهذب ومفيد باللغة العربية. إذا كان المستخدم يريد الحجز، اسأله عن التاريخ المطلوب ثم اجمع معلوماته.
        إذا كان يستعلم عن حجز، اطلب منه الرمز السري.
        إذا كان يريد إلغاء حجز، اطلب منه الرمز السري ثم اطلب تأكيد الإلغاء.
        
        ملاحظة: أنت تتعامل مع قاعدة بيانات حقيقية، لذا تعامل مع المعلومات بجدية.
      `,
    })

    // Return the response
    return NextResponse.json({ response: response.text })
  } catch (error) {
    console.error("Error processing chat:", error)
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 })
  }
}
