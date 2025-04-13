"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Brain, Heart, Target, Scale, ArrowRight } from "lucide-react"

type ScenarioOption = {
  id: string
  title: string
  description: string
  pros: string[]
  cons: string[]
  rationality_score: number
  empathy_score: number
  clarity_score: number
  decisiveness_score: number
}

type ScenarioFeedbackProps = {
  option: ScenarioOption
  onBack: () => void
  onComplete: () => void
  isLoading: boolean
  xpReward: number
}

export function ScenarioFeedback({ option, onBack, onComplete, isLoading, xpReward }: ScenarioFeedbackProps) {
  const totalScore = Math.round(
    (option.rationality_score + option.empathy_score + option.clarity_score + option.decisiveness_score) / 4,
  )

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 65) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 65) return "Good"
    return "Needs Improvement"
  }

  const insights = [
    "You prioritized long-term growth over immediate comfort.",
    "Consider how this decision aligns with your 5-year career plan.",
    "Your choice reflects a moderate risk tolerance.",
    "Watch for confirmation bias in how you evaluated the options.",
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Decision Feedback</CardTitle>
            <CardDescription>Analysis of your decision-making process</CardDescription>
          </div>
          <Badge className="px-3 py-1">+{xpReward} XP</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-muted/50">
          <div className="text-sm font-medium mb-1">Overall Decision Score</div>
          <div className={`text-4xl font-bold ${getScoreColor(totalScore)}`}>{totalScore}</div>
          <div className="text-sm text-muted-foreground">{getScoreLabel(totalScore)}</div>
        </div>

        <div className="grid gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                <span>Rationality</span>
              </div>
              <span className={getScoreColor(option.rationality_score)}>{option.rationality_score}/100</span>
            </div>
            <Progress value={option.rationality_score} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span>Empathy</span>
              </div>
              <span className={getScoreColor(option.empathy_score)}>{option.empathy_score}/100</span>
            </div>
            <Progress value={option.empathy_score} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span>Clarity</span>
              </div>
              <span className={getScoreColor(option.clarity_score)}>{option.clarity_score}/100</span>
            </div>

            <Progress value={option.clarity_score} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4" />
                <span>Decisiveness</span>
              </div>
              <span className={getScoreColor(option.decisiveness_score)}>{option.decisiveness_score}/100</span>
            </div>
            <Progress value={option.decisiveness_score} className="h-2" />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium">Decision Insights</h3>
          <ul className="space-y-2">
            {insights.map((insight, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-3 w-3 text-primary"
                  >
                    <path d="M21 2H3v16h5v4l4-4h5l4-4V2z" />
                    <path d="M9 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
                    <path d="M15 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
                  </svg>
                </div>
                {insight}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border p-4 bg-muted/30">
          <h3 className="font-medium mb-2">Cognitive Bias Alert</h3>
          <div className="flex items-start gap-2">
            <div className="rounded-full bg-yellow-100 p-1 mt-0.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-3 w-3 text-yellow-600"
              >
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            </div>
            <div className="text-sm">
              <span className="font-medium">Confirmation Bias</span>: You may have focused more on information that
              confirmed your initial preference for {option.title}.
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onComplete} disabled={isLoading}>
          {isLoading ? (
            "Saving..."
          ) : (
            <>
              Complete Scenario
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
