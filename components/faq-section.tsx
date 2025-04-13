import { ChevronDown } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "How does Decidely help improve decision-making?",
    answer: "Decidely uses a combination of gamified scenarios, AI coaching, and personalized feedback to help you identify and overcome cognitive biases, improve your decision-making process, and build confidence in your choices."
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we take data security seriously. All your data is encrypted, and we follow industry best practices for data protection. We never share your personal information with third parties without your consent."
  },
  {
    question: "How does the AI coaching work?",
    answer: "Our AI coach uses advanced natural language processing to understand your decision-making patterns and provide personalized guidance. It asks thought-provoking questions, helps identify blind spots, and suggests alternative perspectives."
  },
  {
    question: "Can I use Decidely for business decisions?",
    answer: "Absolutely! Decidely is designed to help with both personal and professional decisions. We offer specific scenarios for business contexts, and our Enterprise plan includes team collaboration features."
  },
  {
    question: "What's the difference between the Free and Pro plans?",
    answer: "The Free plan includes basic features and limited AI coaching, while the Pro plan offers unlimited AI coaching, advanced scenarios, voice journaling, and priority support. You can upgrade anytime."
  },
  {
    question: "How often should I use Decidely?",
    answer: "We recommend using Decidely regularly, ideally a few times a week. Consistent practice helps build better decision-making habits. The app will track your progress and suggest activities based on your usage patterns."
  }
]

export function FAQSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-background px-3 py-1 text-sm">FAQ</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Frequently Asked Questions</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Find answers to common questions about Decidely.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-3xl py-12">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
} 