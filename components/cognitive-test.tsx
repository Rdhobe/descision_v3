"use client"

import { useState } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Question = {
  id: number
  text: string
  options: {
    id: string
    text: string
    bias: string
  }[]
}

const questions: Question[] = [
  {
    id: 1,
    text: "When you've invested time in a project that's clearly failing, you typically:",
    options: [
      { id: "1a", text: "Continue because you've already invested so much", bias: "sunk_cost" },
      { id: "1b", text: "Evaluate if continuing is the best use of future resources", bias: "rational" },
    ],
  },
  {
    id: 2,
    text: "After making a decision, if you learn information that contradicts it, you usually:",
    options: [
      { id: "2a", text: "Look for reasons why the new information might be wrong", bias: "confirmation" },
      { id: "2b", text: "Reconsider your decision based on all available information", bias: "rational" },
    ],
  },
  {
    id: 3,
    text: "When evaluating a situation, you tend to:",
    options: [
      { id: "3a", text: "Focus on information that confirms what you already believe", bias: "confirmation" },
      { id: "3b", text: "Seek out information that might disprove your initial thoughts", bias: "rational" },
    ],
  },
  {
    id: 4,
    text: "When faced with a complex problem, you typically:",
    options: [
      { id: "4a", text: "Break it down into smaller, manageable parts", bias: "rational" },
      { id: "4b", text: "Look for a simple explanation or solution", bias: "simplicity" },
    ],
  },
  {
    id: 5,
    text: "When something bad happens to someone else, you tend to think:",
    options: [
      { id: "5a", text: "They could have prevented it if they made better choices", bias: "just_world" },
      { id: "5b", text: "Sometimes bad things happen due to factors outside our control", bias: "rational" },
    ],
  },
]

type CognitiveTestProps = {
  onSubmit: (data: { primaryBias: string }) => void
}

export function CognitiveTest({ onSubmit }: CognitiveTestProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({})

  const handleAnswerChange = (questionId: number, biasTendency: string) => {
    setAnswers({
      ...answers,
      [questionId]: biasTendency,
    })
  }

  const calculatePrimaryBias = () => {
    const biasCount: Record<string, number> = {}

    Object.values(answers).forEach((bias) => {
      if (bias !== "rational") {
        biasCount[bias] = (biasCount[bias] || 0) + 1
      }
    })

    let primaryBias = "none"
    let maxCount = 0

    Object.entries(biasCount).forEach(([bias, count]) => {
      if (count > maxCount) {
        maxCount = count
        primaryBias = bias
      }
    })

    // If no biases detected or all rational, default to confirmation bias
    return primaryBias === "none" ? "confirmation" : primaryBias
  }

  const handleSubmit = () => {
    const primaryBias = calculatePrimaryBias()
    onSubmit({ primaryBias })
  }

  const isComplete = Object.keys(answers).length === questions.length

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground mb-4">
        These questions will help identify cognitive biases that might affect your decision-making. Answer honestly for
        the most accurate results.
      </p>

      {questions.map((question) => (
        <Card key={question.id} className="p-4">
          <div className="mb-2 font-medium">{question.text}</div>
          <RadioGroup onValueChange={(value) => handleAnswerChange(question.id, value)} value={answers[question.id]}>
            {question.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2 py-2">
                <RadioGroupItem value={option.bias} id={option.id} />
                <Label htmlFor={option.id} className="cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </Card>
      ))}

      {isComplete && (
        <div className="flex justify-end">
          <Button onClick={handleSubmit}>Continue</Button>
        </div>
      )}
    </div>
  )
}
