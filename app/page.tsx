import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronRight } from "lucide-react"
import { Testimonials } from "@/components/testimonials"
import { Features } from "@/components/features"
import { HowItWorks } from "@/components/how-it-works"
import { FAQSection } from "@/components/faq-section"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">اس</span>
              </div>
              <span className="font-heading font-bold text-xl">استراحة السلام</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
                المميزات
              </Link>
              <Link href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
                كيف يعمل
              </Link>
              <Link href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">
                آراء العملاء
              </Link>
              <Link href="#faq" className="text-sm font-medium hover:text-primary transition-colors">
                الأسئلة الشائعة
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link href="/chat">
                <Button>احجز الآن</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4 animate-slide-up">
              <div className="space-y-2">
                <Badge className="mb-2">جديد</Badge>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  احجز استراحتك بذكاء مع <span className="text-primary">المساعد الافتراضي</span>
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  نظام حجز ذكي يعتمد على الذكاء الاصطناعي لتوفير تجربة حجز سلسة وسريعة لاستراحة السلام.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/chat">
                  <Button size="lg" className="gap-1">
                    احجز الآن
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button size="lg" variant="outline">
                    كيف يعمل
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mx-auto lg:mr-0 animate-slide-down">
              <Card className="overflow-hidden border-2 border-primary/20">
                <CardContent className="p-0">
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src="/placeholder.svg?height=500&width=800"
                      alt="استراحة السلام"
                      className="object-cover w-full"
                      width={800}
                      height={500}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end p-6">
                      <div className="space-y-2 text-center w-full">
                        <h3 className="font-heading font-bold text-2xl">استراحة السلام</h3>
                        <p className="text-sm text-muted-foreground">مكان مثالي للراحة والاسترخاء</p>
                        <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                          250 د.ل / اليوم
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <Features />

      {/* How It Works */}
      <HowItWorks />

      {/* Testimonials */}
      <Testimonials />

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <section className="py-16 bg-accent">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">جاهز للحجز؟</h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto">
                استخدم المساعد الذكي للحجز بسهولة وسرعة
              </p>
            </div>
            <Link href="/chat">
              <Button size="lg" className="gap-1">
                احجز الآن
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground text-center md:text-right">
            &copy; 2023 استراحة السلام. جميع الحقوق محفوظة.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
              الشروط والأحكام
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
              سياسة الخصوصية
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
