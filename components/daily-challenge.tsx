"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Award, ArrowRight, Check } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

type Challenge = {
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
  }[]
} | null

type DailyChallengeProps = {
  challenge: Challenge
  progress: number
  isCompleted: boolean
  userId?: string
}

export function DailyChallenge({ challenge, progress, isCompleted, userId }: DailyChallengeProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (!challenge) {
    return (
      <div className="text-center py-8 text-muted-foreground">No challenge available today. Check back tomorrow!</div>
    )
  }

  const completeChallenge = async () => {
    if (!userId || isCompleted) return

    setLoading(true)

    try {
      // Record challenge completion
      const response = await fetch('/api/challenges/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeId: challenge._id,
          userId: userId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to complete challenge')
      }

      const data = await response.json()

      toast({
        title: "Challenge completed!",
        description: `You earned ${challenge.xp_reward} XP.`,
      })

      router.refresh()
    } catch (error) {
      console.error("Error completing challenge:", error)
      toast({
        title: "Error",
        description: "There was an error completing the challenge.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-primary/10 p-2">
          <Award className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h4 className="font-medium">{challenge.title}</h4>
          <p className="text-sm text-muted-foreground">{challenge.description}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Challenge Progress</span>
          <span className="font-medium">{isCompleted ? "Completed" : "In Progress"}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="rounded-lg border p-3">
        <h5 className="font-medium mb-1">Today's Task</h5>
        <p className="text-sm text-muted-foreground mb-3">{challenge.content}</p>
        <div className="flex justify-end">
          {isCompleted ? (
            <Button size="sm" variant="outline" disabled>
              <Check className="mr-2 h-4 w-4" />
              Completed
            </Button>
          ) : (
            <Button size="sm" onClick={completeChallenge} disabled={loading}>
              {loading ? (
                "Completing..."
              ) : (
                <>
                  Complete Challenge
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        <span className="font-medium text-primary">+{challenge.xp_reward} XP</span> for completing today's challenge
      </div>
    </div>
  )
}
