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
import { toast } from "@/components/ui/use-toast"

type Scenario = {
  _id: string
  id: string
  title: string
  description: string
  content: string
  category: string
  difficulty: string
  xp_reward: number
  options: {
    text: string
    is_correct: boolean
    feedback: string
    rationality_score: number
    empathy_score: number
    clarity_score: number
    decisiveness_score: number
  }[]
}

type ScenarioGameProps = {
  scenario: Scenario
  userId: string
  completed: boolean
}

export function ScenarioGame({ scenario, userId, completed }: ScenarioGameProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [reflection, setReflection] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleNextStep = () => {
    if (step === 1 && selectedOption !== null) {
      setStep(2)
    } else if (step === 2) {
      setShowFeedback(true)
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
    return selectedOption !== null ? scenario.options[selectedOption] : null
  }

  const handleComplete = async () => {
    if (selectedOption === null) return

    setIsLoading(true)

    try {
      const option = getSelectedOptionData()
      if (!option) throw new Error("Selected option not found")

      // Calculate total score
      const totalScore = Math.round(
        (option.rationality_score + option.empathy_score + option.clarity_score + option.decisiveness_score) / 4,
      )

      // Record user decision
      const response = await fetch('/api/scenarios/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenarioId: scenario._id,
          optionIndex: selectedOption,
          reflection: reflection,
          totalScore: totalScore,
          xpEarned: scenario.xp_reward,
          scores: {
            rationality: option.rationality_score,
            empathy: option.empathy_score,
            clarity: option.clarity_score,
            decisiveness: option.decisiveness_score
          }
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to complete scenario')
      }

      const data = await response.json()

      toast({
        title: "Scenario completed!",
        description: `You earned ${scenario.xp_reward} XP.`,
      })

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("Error completing scenario:", error)
      toast({
        title: "Error",
        description: "There was an error saving your decision.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (completed) {
    return (
      <div className="container max-w-4xl py-6">
        <Button variant="ghost" size="sm" className="mb-6" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Scenario Already Completed</CardTitle>
            <CardDescription>You have already completed this scenario.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>You've already made a decision for "{scenario.title}". Each scenario can only be completed once.</p>
            <p className="mt-4">Try another scenario to continue improving your decision-making skills!</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
          </CardFooter>
        </Card>
      </div>
    )
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
              {step === 1 ? scenario.content : "Think about why you made this choice and what factors influenced you."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <RadioGroup value={selectedOption?.toString()} onValueChange={(value) => setSelectedOption(parseInt(value))}>
                <div className="space-y-4">
                  {scenario.options.map((option, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="leading-normal">
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            ) : (
              <textarea
                className="w-full min-h-[150px] p-3 rounded-md border"
                placeholder="Write your reflection here..."
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
              />
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" onClick={handlePrevStep} disabled={step === 1}>
              Back
            </Button>
            <Button onClick={handleNextStep} disabled={step === 1 && selectedOption === null}>
              {step === 1 ? "Next" : "See Feedback"}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <ScenarioFeedback
          option={getSelectedOptionData()}
          onBack={handlePrevStep}
          onComplete={handleComplete}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}
