import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star } from "lucide-react"

export function Testimonials() {
  const testimonials = [
    {
      name: "أحمد محمد",
      avatar: "أم",
      role: "عميل",
      content: "تجربة رائعة! المساعد الذكي سهل عملية الحجز بشكل كبير. لم أضطر للانتظار أو التعامل مع الأوراق.",
      rating: 5,
    },
    {
      name: "سارة علي",
      avatar: "سع",
      role: "عميلة",
      content: "أحب كيف يمكنني التحقق من حجزي وإدارته بسهولة. النظام سريع الاستجابة ودقيق جداً.",
      rating: 5,
    },
    {
      name: "محمود خالد",
      avatar: "مخ",
      role: "عميل",
      content: "كنت متشككاً في البداية، لكن المساعد الذكي كان مفيداً للغاية وأجاب على جميع أسئلتي.",
      rating: 4,
    },
  ]

  return (
    <section className="py-16 bg-muted/50" id="testimonials">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">آراء عملائنا</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto">
              اقرأ ما يقوله عملاؤنا عن تجربتهم مع نظام الحجز الذكي
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {Array(testimonial.rating)
                      .fill(0)
                      .map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                      ))}
                    {Array(5 - testimonial.rating)
                      .fill(0)
                      .map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-muted" />
                      ))}
                  </div>
                  <p className="text-muted-foreground">{testimonial.content}</p>
                </CardContent>
                <CardFooter className="border-t pt-4 flex items-center">
                  <Avatar className="h-9 w-9 mr-3">
                    <AvatarFallback className="bg-primary text-primary-foreground">{testimonial.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
