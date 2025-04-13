import { CheckCircle, Brain, Target, Lightbulb } from "lucide-react"

type OnboardingCompleteProps = {
  mbtiType: string
  decisionStyle: string
  primaryBias: string
}

export function OnboardingComplete({ mbtiType, decisionStyle, primaryBias }: OnboardingCompleteProps) {
  const getMbtiDescription = (type: string) => {
    const descriptions: Record<string, string> = {
      INTJ: "Strategic, independent thinker",
      INTP: "Logical, innovative problem solver",
      ENTJ: "Decisive, strategic leader",
      ENTP: "Innovative, resourceful entrepreneur",
      INFJ: "Insightful, principled idealist",
      INFP: "Idealistic, compassionate mediator",
      ENFJ: "Charismatic, empathetic mentor",
      ENFP: "Enthusiastic, creative inspirer",
      ISTJ: "Practical, detail-oriented organizer",
      ISFJ: "Dedicated, warm protector",
      ESTJ: "Efficient, structured manager",
      ESFJ: "Caring, social harmonizer",
      ISTP: "Versatile, practical problem solver",
      ISFP: "Gentle, sensitive artist",
      ESTP: "Energetic, adaptable doer",
      ESFP: "Spontaneous, enthusiastic performer",
    }

    return descriptions[type] || "Thoughtful decision-maker"
  }

  const getDecisionStyleDescription = (style: string) => {
    const descriptions: Record<string, string> = {
      analytical: "Logic-driven with careful consideration",
      intuitive: "Gut-feeling and instinct-based decisions",
      deliberative: "Thorough evaluation of all options",
      spontaneous: "Quick decisions based on immediate feelings",
    }

    return descriptions[style] || "Balanced approach to decisions"
  }

  const getBiasDescription = (bias: string) => {
    const descriptions: Record<string, string> = {
      confirmation: "Watch for seeking confirming evidence",
      sunk_cost: "Tendency to continue based on past investment",
      simplicity: "Preference for simpler over complex solutions",
      just_world: "Belief that people get what they deserve",
    }

    return descriptions[bias] || "Various cognitive tendencies"
  }

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="rounded-full bg-primary/10 p-3 mb-4">
        <CheckCircle className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-2xl font-bold mb-2">Profile Complete!</h3>
      <p className="text-center text-muted-foreground mb-6 max-w-md">
        Based on your responses, we've created your personalized decision-making profile.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
        <div className="flex flex-col items-center p-4 border rounded-lg">
          <Brain className="h-8 w-8 text-primary mb-2" />
          <h4 className="font-semibold">MBTI Type</h4>
          <p className="text-2xl font-bold">{mbtiType}</p>
          <p className="text-xs text-muted-foreground text-center mt-1">{getMbtiDescription(mbtiType)}</p>
        </div>

        <div className="flex flex-col items-center p-4 border rounded-lg">
          <Target className="h-8 w-8 text-primary mb-2" />
          <h4 className="font-semibold">Decision Style</h4>
          <p className="text-2xl font-bold">{decisionStyle.charAt(0).toUpperCase() + decisionStyle.slice(1)}</p>
          <p className="text-xs text-muted-foreground text-center mt-1">{getDecisionStyleDescription(decisionStyle)}</p>
        </div>

        <div className="flex flex-col items-center p-4 border rounded-lg">
          <Lightbulb className="h-8 w-8 text-primary mb-2" />
          <h4 className="font-semibold">Bias Alert</h4>
          <p className="text-2xl font-bold">
            {primaryBias
              .split("_")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </p>
          <p className="text-xs text-muted-foreground text-center mt-1">{getBiasDescription(primaryBias)}</p>
        </div>
      </div>
    </div>
  )
}
