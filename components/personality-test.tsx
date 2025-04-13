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
    type: string
  }[]
}

const questions: Question[] = [
  {
    id: 1,
    text: "At a party, you typically:",
    options: [
      { id: "1a", text: "Interact with many, including strangers", type: "E" },
      { id: "1b", text: "Interact with a few people you know", type: "I" },
    ],
  },
  {
    id: 2,
    text: "You tend to focus on:",
    options: [
      { id: "2a", text: "Realistic situations and concrete information", type: "S" },
      { id: "2b", text: "Possibilities and what might happen in the future", type: "N" },
    ],
  },
  {
    id: 3,
    text: "When making decisions, you typically:",
    options: [
      { id: "3a", text: "Consider logic and consistency", type: "T" },
      { id: "3b", text: "Consider people and circumstances", type: "F" },
    ],
  },
  {
    id: 4,
    text: "When working on a project, you prefer to:",
    options: [
      { id: "4a", text: "Make a detailed plan before starting", type: "J" },
      { id: "4b", text: "Figure it out as you go", type: "P" },
    ],
  },
  {
    id: 5,
    text: "You find it easier to:",
    options: [
      { id: "5a", text: "See the details rather than the big picture", type: "S" },
      { id: "5b", text: "See the big picture rather than the details", type: "N" },
    ],
  },
]

const decisionStyles = [
  { id: "analytical", text: "Analytical", description: "Logic-driven with careful consideration" },
  { id: "intuitive", text: "Intuitive", description: "Gut-feeling and instinct-based decisions" },
  { id: "deliberative", text: "Deliberative", description: "Thorough evaluation of all options" },
  { id: "spontaneous", text: "Spontaneous", description: "Quick decisions based on immediate feelings" },
]

type PersonalityTestProps = {
  onSubmit: (data: { mbtiType: string; decisionStyle: string }) => void
}

export function PersonalityTest({ onSubmit }: PersonalityTestProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [decisionStyle, setDecisionStyle] = useState<string | null>(null)

  const handleAnswerChange = (questionId: number, optionType: string) => {
    setAnswers({
      ...answers,
      [questionId]: optionType,
    })
  }

  const calculateMBTI = () => {
    let e = 0,
      i = 0,
      s = 0,
      n = 0,
      t = 0,
      f = 0,
      j = 0,
      p = 0

    Object.values(answers).forEach((answer) => {
      if (answer === "E") e++
      if (answer === "I") i++
      if (answer === "S") s++
      if (answer === "N") n++
      if (answer === "T") t++
      if (answer === "F") f++
      if (answer === "J") j++
      if (answer === "P") p++
    })

    const mbti = [e > i ? "E" : "I", s > n ? "S" : "N", t > f ? "T" : "F", j > p ? "J" : "P"].join("")

    return mbti
  }

  const handleSubmit = () => {
    const mbtiType = calculateMBTI()
    if (decisionStyle) {
      onSubmit({
        mbtiType,
        decisionStyle,
      })
    }
  }

  const isComplete = Object.keys(answers).length === questions.length && decisionStyle !== null

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground mb-4">
        Answer these questions to help us understand your personality type. There are no right or wrong answers.
      </p>

      {questions.map((question) => (
        <Card key={question.id} className="p-4">
          <div className="mb-2 font-medium">{question.text}</div>
          <RadioGroup onValueChange={(value) => handleAnswerChange(question.id, value)} value={answers[question.id]}>
            {question.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2 py-2">
                <RadioGroupItem value={option.type} id={option.id} />
                <Label htmlFor={option.id} className="cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </Card>
      ))}

      <Card className="p-4">
        <div className="mb-2 font-medium">Which decision-making style do you most identify with?</div>
        <RadioGroup onValueChange={setDecisionStyle} value={decisionStyle || ""}>
          {decisionStyles.map((style) => (
            <div key={style.id} className="flex items-center space-x-2 py-2">
              <RadioGroupItem value={style.id} id={style.id} />
              <div>
                <Label htmlFor={style.id} className="cursor-pointer font-medium">
                  {style.text}
                </Label>
                <p className="text-sm text-muted-foreground">{style.description}</p>
              </div>
            </div>
          ))}
        </RadioGroup>
      </Card>

      {isComplete && (
        <div className="flex justify-end">
          <Button onClick={handleSubmit}>Continue</Button>
        </div>
      )}
    </div>
  )
}
