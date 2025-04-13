"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ScenarioFeedback } from "@/components/scenario-feedback"
import { ArrowLeft, Brain, Target, Heart, Scale } from "lucide-react"

const scenario = {
  title: "Career Crossroads",
  description: "You've received two job offers and need to decide which one to accept.",
  context:
    "You currently work at a mid-sized company with decent pay and work-life balance. You've received two offers:",
  options: [
    {
      id: "option1",
      title: "Startup Opportunity",
      description:
        "A fast-growing startup offering a 30% higher salary, equity options, but longer hours and less stability.",
      pros: ["Higher salary", "Equity potential", "Faster growth opportunities"],
      cons: ["Longer hours", "Less stability", "More pressure"],
      scores: {
        rationality: 75,
        empathy: 60,
        clarity: 80,
        decisiveness: 85,
      },
    },
    {
      id: "option2",
      title: "Corporate Position",
      description:
        "A large, established company offering a 15% higher salary, excellent benefits, stability, but slower career advancement.",
      pros: ["Good stability", "Better work-life balance", "Excellent benefits"],
      cons: ["Lower salary growth potential", "Slower advancement", "More bureaucracy"],
      scores: {
        rationality: 80,
        empathy: 85,
        clarity: 75,
        decisiveness: 70,
      },
    },
    {
      id: "option3",
      title: "Stay at Current Job",
      description:
        "Remain at your current position, negotiate for better conditions, and continue building your reputation there.",
      pros: ["Familiar environment", "Established relationships", "No transition period"],
      cons: ["No immediate salary increase", "Missed opportunities", "Potential stagnation"],
      scores: {
        rationality: 65,
        empathy: 75,
        clarity: 70,
        decisiveness: 60,
      },
    },
  ],
}

export default function CareerCrossroadsPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)

  const handleNextStep = () => {
    if (step === 1 && selectedOption) {
      setStep(2)
    } else if (step === 2) {
      setShowFeedback(true)
    } else if (showFeedback) {
      router.push("/dashboard")
    }
  }

  const handlePrevStep = () => {
    if (step === 2) {
      setStep(1)
    } else if (showFeedback) {
      setShowFeedback(false)
      setStep(2)
    }
  }

  const getSelectedOptionData = () => {
    return scenario.options.find((option) => option.id === selectedOption)
  }

  return (
    <div className="container max-w-4xl py-6">
      <Button variant="ghost" size="sm" className="mb-6" onClick={() => router.push("/dashboard")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{scenario.title}</h1>
        <p className="text-muted-foreground">{scenario.description}</p>
        {!showFeedback && (
          <div className="mt-4">
            <Progress value={(step / 2) * 100} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">Step {step} of 2</p>
          </div>
        )}
      </div>

      {!showFeedback ? (
        <Card>
          <CardHeader>
            <CardTitle>{step === 1 ? "Consider Your Options" : "Reflect on Your Decision"}</CardTitle>
            <CardDescription>
              {step === 1 ? scenario.context : "Think about why you made this choice and what factors influenced you."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <RadioGroup value={selectedOption || ""} onValueChange={setSelectedOption} className="space-y-4">
                {scenario.options.map((option) => (
                  <div key={option.id} className="flex items-start space-x-2 border rounded-lg p-4">
                    <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor={option.id} className="text-base font-medium cursor-pointer">
                        {option.title}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Pros</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {option.pros.map((pro, index) => (
                              <li key={index} className="flex items-center">
                                <span className="text-green-500 mr-2">+</span> {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">Cons</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {option.cons.map((con, index) => (
                              <li key={index} className="flex items-center">
                                <span className="text-red-500 mr-2">-</span> {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Your Choice: {getSelectedOptionData()?.title}</h3>
                  <p className="text-sm text-muted-foreground">{getSelectedOptionData()?.description}</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Decision Factors</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 border rounded-lg p-3">
                      <Brain className="h-5 w-5 text-primary" />
                      <div>
                        <div className="text-sm font-medium">Logical Factors</div>
                        <div className="text-xs text-muted-foreground">Salary, benefits, growth</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 border rounded-lg p-3">
                      <Heart className="h-5 w-5 text-pink-500" />
                      <div>
                        <div className="text-sm font-medium">Emotional Factors</div>
                        <div className="text-xs text-muted-foreground">Satisfaction, stress, culture</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 border rounded-lg p-3">
                      <Target className="h-5 w-5 text-orange-500" />
                      <div>
                        <div className="text-sm font-medium">Long-term Goals</div>
                        <div className="text-xs text-muted-foreground">Career path, skill development</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 border rounded-lg p-3">
                      <Scale className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="text-sm font-medium">Values Alignment</div>
                        <div className="text-xs text-muted-foreground">Work-life balance, purpose</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handlePrevStep} disabled={step === 1}>
              Back
            </Button>
            <Button onClick={handleNextStep} disabled={step === 1 && !selectedOption}>
              {step === 1 ? "Continue" : "See Feedback"}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <ScenarioFeedback 
          option={{
            ...getSelectedOptionData()!,
            rationality_score: getSelectedOptionData()!.scores.rationality,
            empathy_score: getSelectedOptionData()!.scores.empathy,
            clarity_score: getSelectedOptionData()!.scores.clarity,
            decisiveness_score: getSelectedOptionData()!.scores.decisiveness
          }} 
          onBack={handlePrevStep} 
          onComplete={handleNextStep}
          isLoading={false}
          xpReward={50}
        />
      )}
    </div>
  )
}
