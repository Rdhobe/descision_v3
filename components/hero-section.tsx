import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Brain } from "lucide-react"

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Master Your Decisions, Level Up Your Life
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                A gamified approach to becoming more rational, decisive, and self-aware through interactive
                decision-making.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/signup">
                <Button size="lg" className="px-8">
                  Get Started
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="px-8">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-[400px] aspect-square">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full opacity-20 blur-3xl"></div>
              <div className="relative bg-card border rounded-xl shadow-xl overflow-hidden h-full flex items-center justify-center">
                <div className="p-8 text-center">
                  <div className="flex justify-center mb-6">
                    <Brain className="h-16 w-16 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Become a Decision Master</h3>
                  <p className="text-muted-foreground">
                    Play through scenarios, learn from feedback, and level up your decision-making skills.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
