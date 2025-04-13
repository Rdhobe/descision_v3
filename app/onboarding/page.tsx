"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PersonalityTest } from "@/components/personality-test"
import { CognitiveTest } from "@/components/cognitive-test"
import { OnboardingComplete } from "@/components/onboarding-complete"
import { toast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [step, setStep] = useState(1)
  const totalSteps = 3
  const [personalityData, setPersonalityData] = useState<{
    mbtiType: string | null
    decisionStyle: string | null
  }>({
    mbtiType: null,
    decisionStyle: null,
  })
  const [cognitiveData, setCognitiveData] = useState<{
    primaryBias: string | null
  }>({
    primaryBias: null,
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const handlePersonalitySubmit = (data: { mbtiType: string; decisionStyle: string }) => {
    setPersonalityData(data)
    setStep(2)
  }

  const handleCognitiveSubmit = (data: { primaryBias: string }) => {
    setCognitiveData(data)
    setStep(3)
  }

  const completeOnboarding = async () => {
    if (!session?.user) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mbtiType: personalityData.mbtiType,
          decisionStyle: personalityData.decisionStyle,
          primaryBias: cognitiveData.primaryBias,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      router.push("/dashboard")
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: "Error",
        description: "There was an error saving your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  if (status === "loading") {
    return (
      <div className="container max-w-4xl py-10">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Let&apos;s Get to Know You</h1>
        <p className="text-muted-foreground">Complete these quick assessments to personalize your experience.</p>
        <div className="mt-4">
          <Progress value={(step / totalSteps) * 100} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            Step {step} of {totalSteps}
          </p>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            {step === 1 && "Personality Assessment"}
            {step === 2 && "Cognitive Biases Test"}
            {step === 3 && "All Set!"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Discover your MBTI personality type"}
            {step === 2 && "Identify your cognitive biases and decision patterns"}
            {step === 3 && "Your profile is ready"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && <PersonalityTest onSubmit={handlePersonalitySubmit} />}
          {step === 2 && <CognitiveTest onSubmit={handleCognitiveSubmit} />}
          {step === 3 && (
            <OnboardingComplete
              mbtiType={personalityData.mbtiType || "INTJ"}
              decisionStyle={personalityData.decisionStyle || "Analytical"}
              primaryBias={cognitiveData.primaryBias || "Confirmation"}
            />
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={prevStep} disabled={step === 1}>
            Back
          </Button>
          {step < 3 ? (
            <Button
              onClick={() => (step === 1 ? setStep(2) : setStep(3))}
              disabled={(step === 1 && !personalityData.mbtiType) || (step === 2 && !cognitiveData.primaryBias)}
            >
              Continue
            </Button>
          ) : (
            <Button onClick={completeOnboarding} disabled={isLoading}>
              {isLoading ? "Saving..." : "Go to Dashboard"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
