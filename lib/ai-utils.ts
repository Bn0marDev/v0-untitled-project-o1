import {
  checkDateAvailability,
  createBooking,
  createVerificationCode,
  verifyOTP,
  getBookingBySecretCode,
  cancelBooking,
} from "./db"
import { sendVerificationEmail, sendBookingConfirmationEmail } from "./email"

// Define conversation states
type ConversationState =
  | "initial"
  | "collecting_date"
  | "collecting_info"
  | "confirming_booking"
  | "verifying_otp"
  | "booking_confirmed"
  | "checking_booking"
  | "cancelling_booking"

// Store conversation state for each user
const userStates = new Map<
  string,
  {
    state: ConversationState
    bookingDate?: string
    customerName?: string
    customerPhone?: string
    customerEmail?: string
    bookingReference?: string
    secretCode?: string
    otpCode?: string
  }
>()

export async function handleUserMessage(userId: string, message: string) {
  // Get or initialize user state
  let userState = userStates.get(userId)
  if (!userState) {
    userState = { state: "initial" }
    userStates.set(userId, userState)
  }

  // Process message based on current state
  switch (userState.state) {
    case "initial":
      return await handleInitialState(userId, message)

    case "collecting_date":
      return await handleDateCollection(userId, message)

    case "collecting_info":
      return await handleInfoCollection(userId, message)

    case "confirming_booking":
      return await handleBookingConfirmation(userId, message)

    case "verifying_otp":
      return await handleOTPVerification(userId, message)

    case "checking_booking":
      return await handleBookingCheck(userId, message)

    case "cancelling_booking":
      return await handleBookingCancellation(userId, message)

    default:
      return await generateResponse("مرحباً بك في نظام حجز استراحة السلام. كيف يمكنني مساعدتك اليوم؟")
  }
}

async function handleInitialState(userId: string, message: string) {
  // Check if message contains booking intent
  const isBookingIntent = await detectBookingIntent(message)

  if (isBookingIntent) {
    // Update state to collecting date
    const userState = userStates.get(userId)!
    userState.state = "collecting_date"
    userStates.set(userId, userState)

    return await generateResponse(
      "أهلاً بك في نظام حجز استراحة السلام! سعر الحجز ليوم واحد هو 250 دينار ليبي. " +
        "يرجى تحديد التاريخ الذي ترغب في الحجز فيه بصيغة (YYYY-MM-DD).",
    )
  } else if (message.includes("حجز") && message.includes("تحقق")) {
    // User wants to check booking status
    const userState = userStates.get(userId)!
    userState.state = "checking_booking"
    userStates.set(userId, userState)

    return await generateResponse("يرجى إدخال الرمز السري الخاص بحجزك للتحقق من حالته.")
  } else {
    // General greeting or unrecognized intent
    return await generateResponse(
      "مرحباً بك في نظام حجز استراحة السلام. يمكنني مساعدتك في حجز الاستراحة، أو التحقق من حجز موجود. كيف يمكنني مساعدتك اليوم؟",
    )
  }
}

async function handleDateCollection(userId: string, message: string) {
  // Try to extract date from message
  const dateMatch = message.match(/\d{4}-\d{2}-\d{2}/)

  if (!dateMatch) {
    return await generateResponse(
      "عذراً، لم أتمكن من فهم التاريخ. يرجى إدخال التاريخ بصيغة YYYY-MM-DD، مثال: 2023-12-31",
    )
  }

  const bookingDate = dateMatch[0]

  // Check if date is in the past
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (new Date(bookingDate) < today) {
    return await generateResponse("عذراً، لا يمكن الحجز في تاريخ سابق. يرجى اختيار تاريخ مستقبلي.")
  }

  // Check if date is available
  const isAvailable = await checkDateAvailability(bookingDate)

  if (!isAvailable) {
    return await generateResponse(`عذراً، التاريخ ${bookingDate} غير متاح للحجز. يرجى اختيار تاريخ آخر.`)
  }

  // Update state with booking date
  const userState = userStates.get(userId)!
  userState.bookingDate = bookingDate
  userState.state = "collecting_info"
  userStates.set(userId, userState)

  return await generateResponse(
    `التاريخ ${bookingDate} متاح للحجز! يرجى تزويدنا بالمعلومات التالية في رسالة واحدة:
    - الاسم الكامل
    - رقم الهاتف
    - البريد الإلكتروني (لإرسال تأكيد الحجز)`,
  )
}

async function handleInfoCollection(userId: string, message: string) {
  // Try to extract customer information
  const nameMatch = message.match(/[ء-ي\s]{3,}/)
  const phoneMatch = message.match(/\d{10,}/)
  const emailMatch = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)

  if (!nameMatch || !phoneMatch || !emailMatch) {
    return await generateResponse(
      "عذراً، يرجى تقديم جميع المعلومات المطلوبة: الاسم الكامل، رقم الهاتف، والبريد الإلكتروني.",
    )
  }

  // Update state with customer information
  const userState = userStates.get(userId)!
  userState.customerName = nameMatch[0].trim()
  userState.customerPhone = phoneMatch[0].trim()
  userState.customerEmail = emailMatch[0].trim()
  userState.state = "confirming_booking"
  userStates.set(userId, userState)

  return await generateResponse(
    `شكراً لتقديم معلوماتك. يرجى تأكيد تفاصيل الحجز التالية:
    
    - الاسم: ${userState.customerName}
    - رقم الهاتف: ${userState.customerPhone}
    - البريد الإلكتروني: ${userState.customerEmail}
    - تاريخ الحجز: ${userState.bookingDate}
    - السعر: 250 د.ل
    
    هل تريد تأكيد الحجز؟ (نعم/لا)`,
  )
}

async function handleBookingConfirmation(userId: string, message: string) {
  const isConfirmed = message.includes("نعم") || message.includes("تأكيد") || message.toLowerCase().includes("yes")

  if (!isConfirmed) {
    // Reset state
    userStates.delete(userId)

    return await generateResponse("تم إلغاء عملية الحجز. يمكنك بدء عملية حجز جديدة في أي وقت.")
  }

  // Create booking in database
  const userState = userStates.get(userId)!

  try {
    const { bookingId, bookingReference, secretCode } = await createBooking(
      userState.customerName!,
      userState.customerPhone!,
      userState.bookingDate!,
    )

    // Generate OTP code
    const otpCode = await createVerificationCode(bookingId)

    // Send verification email - if it fails, we'll still continue
    const emailSent = await sendVerificationEmail(
      userState.customerEmail!,
      userState.customerName!,
      userState.bookingDate!,
      otpCode,
      bookingReference,
    )

    // Update state
    userState.bookingReference = bookingReference
    userState.secretCode = secretCode
    userState.otpCode = otpCode
    userState.state = "verifying_otp"
    userStates.set(userId, userState)

    let emailMessage = ""
    if (!emailSent) {
      emailMessage =
        "\n\nملاحظة: لم نتمكن من إرسال رمز التحقق عبر البريد الإلكتروني. يرجى استخدام الرمز التالي: " + otpCode
    }

    return await generateResponse(
      `تم إنشاء حجزك بنجاح! رقم الحجز الخاص بك هو: ${bookingReference}
      
      لقد أرسلنا رمز التحقق إلى بريدك الإلكتروني ${userState.customerEmail}. يرجى إدخال رمز التحقق المكون من 4 أرقام لتأكيد حجزك.${emailMessage}`,
    )
  } catch (error) {
    console.error("Error creating booking:", error)

    return await generateResponse("عذراً، حدث خطأ أثناء إنشاء الحجز. يرجى المحاولة مرة أخرى لاحقاً.")
  }
}

// Update the handleOTPVerification function to handle email failures
async function handleOTPVerification(userId: string, message: string) {
  // Extract OTP from message
  const otpMatch = message.match(/\d{4}/)

  if (!otpMatch) {
    return await generateResponse(
      "عذراً، لم أتمكن من التعرف على رمز التحقق. يرجى إدخال الرمز المكون من 4 أرقام الذي تم إرساله إلى بريدك الإلكتروني.",
    )
  }

  const userState = userStates.get(userId)!
  const enteredOTP = otpMatch[0]

  // For development/testing, allow any OTP to work if it matches the one in state
  // This is important for testing when email sending fails
  const isVerified = enteredOTP === userState.otpCode || (await verifyOTP(userState.bookingReference!, enteredOTP))

  if (!isVerified) {
    return await generateResponse("عذراً، رمز التحقق غير صحيح أو منتهي الصلاحية. يرجى التحقق والمحاولة مرة أخرى.")
  }

  // Send confirmation email with secret code
  // If email fails, continue anyway since we have the secret code in the response
  const emailSent = await sendBookingConfirmationEmail(
    userState.customerEmail!,
    userState.customerName!,
    userState.bookingDate!,
    userState.bookingReference!,
    userState.secretCode!,
  )

  // Update state
  userState.state = "booking_confirmed"
  userStates.set(userId, userState)

  let emailMessage = ""
  if (!emailSent) {
    emailMessage = "\n\nملاحظة: لم نتمكن من إرسال بريد إلكتروني للتأكيد. يرجى الاحتفاظ بالرمز السري المعروض أدناه."
  }

  return await generateResponse(
    `تم تأكيد حجزك بنجاح! 
    
    تفاصيل الحجز:
    - رقم الحجز: ${userState.bookingReference}
    - تاريخ الحجز: ${userState.bookingDate}
    - السعر: 250 د.ل
    
    الرمز السري الخاص بك هو: ${userState.secretCode}
    
    احتفظ بهذا الرمز للاستعلام عن حجزك أو إلغائه أو تمديده في المستقبل.
    
    شكراً لاختيارك استراحة السلام!${emailMessage}`,
  )
}

async function handleBookingCheck(userId: string, message: string) {
  // Extract secret code from message
  const secretCodeMatch = message.match(/\d{6}/)

  if (!secretCodeMatch) {
    return await generateResponse(
      "عذراً، لم أتمكن من التعرف على الرمز السري. يرجى إدخال الرمز السري المكون من 6 أرقام الذي تم إعطاؤه لك عند تأكيد الحجز.",
    )
  }

  const secretCode = secretCodeMatch[0]

  // Get booking details
  const booking = await getBookingBySecretCode(secretCode)

  if (!booking) {
    return await generateResponse(
      "عذراً، لم يتم العثور على حجز بهذا الرمز السري. يرجى التحقق من الرمز والمحاولة مرة أخرى.",
    )
  }

  // Calculate days remaining
  const bookingDate = new Date(booking.booking_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const daysRemaining = Math.ceil((bookingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  // Update state
  const userState = userStates.get(userId)!
  userState.bookingReference = booking.booking_reference
  userState.bookingDate = booking.booking_date
  userState.secretCode = secretCode
  userStates.set(userId, userState)

  let statusMessage = ""

  if (booking.status === "confirmed") {
    if (daysRemaining > 0) {
      statusMessage = `متبقي ${daysRemaining} يوم على موعد حجزك.`

      // Ask if user wants to cancel
      userState.state = "cancelling_booking"
      userStates.set(userId, userState)

      return await generateResponse(
        `تفاصيل حجزك:
        - رقم الحجز: ${booking.booking_reference}
        - تاريخ الحجز: ${booking.booking_date}
        - الحالة: مؤكد
        - ${statusMessage}
        
        هل ترغب في إلغاء هذا الحجز؟ (نعم/لا)`,
      )
    } else if (daysRemaining === 0) {
      statusMessage = "حجزك هو اليوم!"
    } else {
      statusMessage = "انتهى موعد حجزك."
    }
  } else if (booking.status === "pending") {
    statusMessage = "حجزك في انتظار التأكيد."
  } else {
    statusMessage = "تم إلغاء حجزك."
  }

  // Reset state
  userState.state = "initial"
  userStates.set(userId, userState)

  return await generateResponse(
    `تفاصيل حجزك:
    - رقم الحجز: ${booking.booking_reference}
    - تاريخ الحجز: ${booking.booking_date}
    - الحالة: ${booking.status === "confirmed" ? "مؤكد" : booking.status === "pending" ? "في الانتظار" : "ملغي"}
    - ${statusMessage}
    
    شكراً لاستخدامك نظام حجز استراحة السلام!`,
  )
}

async function handleBookingCancellation(userId: string, message: string) {
  const isConfirmed = message.includes("نعم") || message.includes("إلغاء") || message.toLowerCase().includes("yes")

  if (!isConfirmed) {
    // Reset state
    userStates.delete(userId)

    return await generateResponse("تم إلغاء عملية إلغاء الحجز. حجزك لا يزال مؤكداً.")
  }

  const userState = userStates.get(userId)!

  // Cancel booking
  const isCancelled = await cancelBooking(userState.secretCode!)

  if (!isCancelled) {
    return await generateResponse("عذراً، حدث خطأ أثناء إلغاء الحجز. يرجى المحاولة مرة أخرى لاحقاً.")
  }

  // Reset state
  userStates.delete(userId)

  return await generateResponse(
    `تم إلغاء حجزك بنجاح!
    
    تفاصيل الحجز الملغي:
    - رقم الحجز: ${userState.bookingReference}
    - تاريخ الحجز: ${userState.bookingDate}
    
    شكراً لاستخدامك نظام حجز استراحة السلام. نأمل أن نراك قريباً!`,
  )
}

async function detectBookingIntent(message: string) {
  // Simple intent detection based on keywords
  const bookingKeywords = ["حجز", "استراحة", "يوم", "تاريخ", "book", "booking", "reserve"]

  let matchCount = 0
  for (const keyword of bookingKeywords) {
    if (message.includes(keyword)) {
      matchCount++
    }
  }

  return matchCount >= 2
}

// Update the generateResponse function to be more sophisticated
// This simulates the Qrok Cloud AI response generation
async function generateResponse(message: string) {
  // In a real implementation, this would call the Qrok Cloud API
  // For now, we'll just return the message with some enhancements

  // Add some variation to responses
  const greetings = ["أهلاً بك! ", "مرحباً! ", "أهلاً وسهلاً! ", ""]

  const closings = [
    " شكراً لاختيارك استراحة السلام.",
    " نحن هنا لمساعدتك.",
    " هل هناك أي شيء آخر يمكنني مساعدتك به؟",
    "",
  ]

  // Only add greetings and closings sometimes to make it feel more natural
  const shouldAddGreeting = Math.random() > 0.7
  const shouldAddClosing = Math.random() > 0.7

  const greeting = shouldAddGreeting ? greetings[Math.floor(Math.random() * greetings.length)] : ""
  const closing = shouldAddClosing ? closings[Math.floor(Math.random() * closings.length)] : ""

  return greeting + message + closing
}
