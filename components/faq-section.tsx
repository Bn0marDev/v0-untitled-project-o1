import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FAQSection() {
  const faqs = [
    {
      question: "كيف يعمل نظام الحجز الذكي؟",
      answer:
        "يعتمد نظام الحجز الذكي على تقنية الذكاء الاصطناعي لفهم طلبات العملاء وتوجيههم خلال عملية الحجز. يمكنك ببساطة بدء محادثة مع المساعد الذكي، وتحديد التاريخ المطلوب، وتقديم معلوماتك الشخصية، ثم تأكيد الحجز باستخدام رمز التحقق.",
    },
    {
      question: "هل يمكنني إلغاء حجزي؟",
      answer:
        "نعم، يمكنك إلغاء حجزك في أي وقت قبل 24 ساعة من موعد الحجز. ما عليك سوى استخدام الرمز السري الذي حصلت عليه عند تأكيد الحجز، وسيساعدك المساعد الذكي في عملية الإلغاء.",
    },
    {
      question: "كم تبلغ تكلفة حجز الاستراحة؟",
      answer:
        "تكلفة حجز استراحة السلام هي 250 دينار ليبي لليوم الواحد. يمكنك الدفع عند الوصول أو من خلال التحويل المصرفي.",
    },
    {
      question: "هل يمكنني تعديل تاريخ الحجز؟",
      answer:
        "نعم، يمكنك تعديل تاريخ الحجز قبل 48 ساعة من الموعد المحدد. ما عليك سوى التواصل مع المساعد الذكي باستخدام الرمز السري الخاص بك وطلب تغيير التاريخ، وسيتم التحقق من توفر التاريخ الجديد.",
    },
    {
      question: "ماذا لو واجهت مشكلة في استخدام المساعد الذكي؟",
      answer:
        "إذا واجهت أي مشكلة في استخدام المساعد الذكي، يمكنك التواصل مع فريق الدعم الفني على الرقم 123456789 أو إرسال بريد إلكتروني إلى support@estrahatsalam.ly وسيتم مساعدتك في أقرب وقت ممكن.",
    },
    {
      question: "هل يمكنني حجز الاستراحة لأكثر من يوم؟",
      answer:
        "نعم، يمكنك حجز الاستراحة لأي عدد من الأيام حسب توفرها. ما عليك سوى تحديد تاريخ البداية وعدد الأيام المطلوبة، وسيقوم المساعد الذكي بالتحقق من التوفر وإتمام عملية الحجز.",
    },
  ]

  return (
    <section className="py-16" id="faq">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">الأسئلة الشائعة</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto">
              إجابات على الأسئلة الأكثر شيوعاً حول نظام الحجز الذكي
            </p>
          </div>
          <div className="w-full max-w-3xl mt-8">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-right">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-right text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  )
}
