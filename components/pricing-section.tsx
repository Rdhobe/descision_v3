import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for trying out Decidely",
    features: [
      "Basic decision scenarios",
      "Limited AI coaching",
      "Progress tracking",
      "Community access"
    ],
    buttonText: "Get Started",
    buttonVariant: "outline" as const
  },
  {
    name: "Pro",
    price: "$9.99",
    description: "Best for serious decision-makers",
    features: [
      "All Free features",
      "Unlimited AI coaching",
      "Advanced scenarios",
      "Priority support",
      "Voice journaling",
      "Decision logbook"
    ],
    buttonText: "Upgrade Now",
    buttonVariant: "default" as const,
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For teams and organizations",
    features: [
      "All Pro features",
      "Team management",
      "Custom scenarios",
      "API access",
      "Dedicated support",
      "Analytics dashboard"
    ],
    buttonText: "Contact Sales",
    buttonVariant: "outline" as const
  }
]

export function PricingSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Pricing</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Simple, Transparent Pricing</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Choose the plan that's right for you. Start free, upgrade anytime.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`flex flex-col space-y-4 rounded-lg border p-6 shadow-sm ${
                plan.popular ? "border-primary" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute right-0 top-0 rounded-r-sm bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                  Popular
                </div>
              )}
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="text-3xl font-bold">{plan.price}</p>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>
              <ul className="flex-1 space-y-2">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <Button className="w-full" variant={plan.buttonVariant}>
                  {plan.buttonText}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 