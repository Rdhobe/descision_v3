import { Brain, Target, Lightbulb, BarChart4, Users, Shield } from "lucide-react"

export function FeatureSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32" id="features">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Features</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Level Up Your Decision-Making</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our app combines gamification with deep coaching to help you make better decisions in all areas of life.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Personality Insights</h3>
            <p className="text-center text-muted-foreground">
              Discover your MBTI type, decision style, and cognitive biases through gamified assessments.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Decision Scenarios</h3>
            <p className="text-center text-muted-foreground">
              Practice with real-life scenarios across career, finance, relationships, and more.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <Lightbulb className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">AI Coaching</h3>
            <p className="text-center text-muted-foreground">
              Get personalized guidance from our AI coach using the Socratic method.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <BarChart4 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Progress Tracking</h3>
            <p className="text-center text-muted-foreground">
              Track your growth in rationality, empathy, clarity, and decisiveness.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Community Learning</h3>
            <p className="text-center text-muted-foreground">
              Share dilemmas anonymously and learn from others' experiences.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Support Tools</h3>
            <p className="text-center text-muted-foreground">
              Access voice journaling, decision logbooks, and emergency support.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
