import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Calendar, CheckCircle, ArrowRight } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: <MessageSquare className="h-12 w-12 text-primary" />,
      title: "بدء المحادثة",
      description: "ابدأ محادثة مع المساعد الذكي وأخبره برغبتك في حجز الاستراحة.",
    },
    {
      icon: <Calendar className="h-12 w-12 text-primary" />,
      title: "اختيار التاريخ",
      description: "حدد التاريخ المناسب لك وسيتحقق النظام من توفره.",
    },
    {
      icon: <ArrowRight className="h-12 w-12 text-primary" />,
      title: "تقديم المعلومات",
      description: "قدم معلوماتك الشخصية مثل الاسم ورقم الهاتف والبريد الإلكتروني.",
    },
    {
      icon: <CheckCircle className="h-12 w-12 text-primary" />,
      title: "تأكيد الحجز",
      description: "أدخل رمز التحقق المرسل إلى بريدك الإلكتروني لتأكيد الحجز.",
    },
  ]

  return (
    <section className="py-16" id="how-it-works">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">كيف يعمل نظام الحجز</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto">
              أربع خطوات بسيطة للحصول على حجزك
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {steps.map((step, index) => (
              <Card
                key={index}
                className="relative overflow-hidden border-2 border-primary/20 animate-slide-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground w-8 h-8 flex items-center justify-center font-bold rounded-bl-lg">
                  {index + 1}
                </div>
                <CardContent className="pt-12 pb-8 flex flex-col items-center text-center">
                  <div className="mb-4">{step.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
