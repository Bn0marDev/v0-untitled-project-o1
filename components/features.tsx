import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MessageSquare, Clock, Shield, Zap, Sparkles } from "lucide-react"

export function Features() {
  const features = [
    {
      icon: <MessageSquare className="h-10 w-10 text-primary" />,
      title: "محادثة ذكية",
      description: "تفاعل مع مساعدنا الذكي الذي يفهم احتياجاتك ويساعدك في الحجز بسهولة.",
    },
    {
      icon: <Calendar className="h-10 w-10 text-primary" />,
      title: "حجز سريع",
      description: "احجز استراحتك في دقائق معدودة دون الحاجة لملء نماذج معقدة.",
    },
    {
      icon: <Clock className="h-10 w-10 text-primary" />,
      title: "متاح 24/7",
      description: "نظام الحجز متاح على مدار الساعة طوال أيام الأسبوع لخدمتك في أي وقت.",
    },
    {
      icon: <Shield className="h-10 w-10 text-primary" />,
      title: "آمن وموثوق",
      description: "بياناتك ومعلوماتك الشخصية محمية بأحدث تقنيات الأمان.",
    },
    {
      icon: <Zap className="h-10 w-10 text-primary" />,
      title: "تأكيد فوري",
      description: "احصل على تأكيد حجزك فوراً عبر البريد الإلكتروني مع كافة التفاصيل.",
    },
    {
      icon: <Sparkles className="h-10 w-10 text-primary" />,
      title: "تجربة مخصصة",
      description: "يتذكر النظام تفضيلاتك لتقديم تجربة حجز مخصصة في كل مرة.",
    },
  ]

  return (
    <section className="py-16 bg-muted/50" id="features">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2 animate-fade-in">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">مميزات نظام الحجز الذكي</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto">
              اكتشف كيف يمكن لنظامنا الذكي أن يجعل حجز استراحة السلام تجربة سهلة وممتعة
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {features.map((feature, index) => (
              <Card key={index} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  {feature.icon}
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
