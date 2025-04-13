'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle } from "lucide-react"

interface ScenarioFeedbackProps {
  isCorrect: boolean
  feedback: string
  explanation: string
}

export function ScenarioFeedback({ 
  isCorrect, 
  feedback, 
  explanation 
}: ScenarioFeedbackProps) {
  return (
    <Card className={isCorrect ? "border-green-500" : "border-red-500"}>
      <CardHeader>
        <div className="flex items-center gap-2">
          {isCorrect ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          <CardTitle>{isCorrect ? "Correct!" : "Incorrect"}</CardTitle>
        </div>
        <CardDescription>{feedback}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <h3 className="font-semibold">Explanation</h3>
          <p className="text-muted-foreground">{explanation}</p>
        </div>
      </CardContent>
    </Card>
  )
} 