'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import ShareScenarioButton from '@/components/ShareScenarioButton'

interface Challenge {
  _id: string
  title: string
  description: string
  category: string
  content: string
  difficulty: string
  xp_reward: number
  options: {
    text: string
    is_correct: boolean
    feedback: string
  }[]
}

export default function ChallengePage() {
  const router = useRouter()
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Get challenge from localStorage
    const storedChallenge = localStorage.getItem('currentChallenge')
    if (storedChallenge) {
      setChallenge(JSON.parse(storedChallenge))
    } else {
      router.push('/dashboard')
    }
  }, [router])

  const handleOptionSelect = async (optionIndex: number) => {
    if (isSubmitting || feedback) return
    setIsSubmitting(true)
    setSelectedOption(optionIndex)

    const option = challenge?.options[optionIndex]
    if (!challenge || !option) return

    try {
      const response = await fetch('/api/challenge/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeId: challenge._id,
          optionChosen: option.text,
          isCorrect: option.is_correct,
          xpReward: option.is_correct ? challenge.xp_reward : 0
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit challenge response')
      }

      setFeedback(option.feedback)
    } catch (error) {
      console.error('Error submitting challenge:', error)
      setFeedback('Error submitting your response. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContinue = () => {
    localStorage.removeItem('currentChallenge')
    router.push('/dashboard')
  }

  if (!challenge) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Daily Challenge</h1>
        {challenge && (
          <ShareScenarioButton 
            scenarioId={challenge._id}
            scenarioType="challenge"
            scenarioData={{
              title: challenge.title,
              description: challenge.description,
              category: challenge.category,
              difficulty: parseInt(challenge.difficulty),
              xp_reward: challenge.xp_reward
            }}
          />
        )}
      </div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{challenge.title}</CardTitle>
              <CardDescription>{challenge.category}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant={
                challenge.difficulty === 'easy' ? 'default' :
                challenge.difficulty === 'medium' ? 'secondary' : 'destructive'
              }>
                {challenge.difficulty}
              </Badge>
              <Badge variant="outline">+{challenge.xp_reward} XP</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg">{challenge.content}</p>
          
          <div className="space-y-4">
            {challenge.options.map((option, index) => (
              <Button
                key={index}
                variant={selectedOption === index ? 
                  (option.is_correct ? "default" : "destructive") : 
                  "outline"
                }
                className="w-full justify-start p-4 h-auto text-left"
                onClick={() => handleOptionSelect(index)}
                disabled={isSubmitting || feedback !== null}
              >
                {option.text}
              </Button>
            ))}
          </div>

          {feedback && (
            <div className="mt-6 space-y-4">
              <p className="text-lg font-medium">{feedback}</p>
              <Button onClick={handleContinue}>
                Continue to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 