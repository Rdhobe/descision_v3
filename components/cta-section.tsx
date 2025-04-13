import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Brain } from "lucide-react"

export function CTASection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Ready to Start?</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Transform Your Decision-Making Today</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Join thousands of users who have improved their decision-making skills with Decidely. Start your journey to better choices now.
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <Link href="/signup">
              <Button size="lg" className="px-8">
                Get Started Free
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="px-8">
                Learn More
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center space-x-4 pt-8">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-10 w-10 rounded-full border-2 border-background bg-muted"
                  style={{
                    backgroundImage: `url(https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${i}.jpg)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Join <span className="font-semibold">10,000+</span> users making better decisions
            </p>
          </div>
        </div>
      </div>
    </section>
  )
} 