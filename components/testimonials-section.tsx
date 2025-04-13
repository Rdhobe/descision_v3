import { Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Product Manager",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    content: "Decidely has transformed how I approach decisions at work. The AI coach helped me see blind spots I never knew I had.",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "Entrepreneur",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    content: "The gamification aspect makes learning about decision-making fun and engaging. I've improved my clarity and confidence significantly.",
    rating: 5
  },
  {
    name: "Emma Rodriguez",
    role: "Student",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    content: "As someone who struggles with indecision, this app has been a game-changer. The scenarios are realistic and the feedback is incredibly helpful.",
    rating: 5
  }
]

export function TestimonialsSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-background px-3 py-1 text-sm">Testimonials</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">What Our Users Say</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Hear from people who have transformed their decision-making skills with Decidely.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="flex flex-col space-y-4 rounded-lg border bg-background p-6 shadow-sm">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={testimonial.image} />
                  <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{testimonial.name}</h3>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-muted-foreground">{testimonial.content}</p>
              <div className="flex">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 