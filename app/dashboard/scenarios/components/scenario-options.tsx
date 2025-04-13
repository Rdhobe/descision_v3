'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface Option {
  text: string
  is_correct: boolean
}

interface ScenarioOptionsProps {
  options: Option[]
  selectedOption: string | null
  onOptionSelect: (optionText: string) => void
  onSubmit: () => void
  isSubmitted: boolean
}

export function ScenarioOptions({ 
  options, 
  selectedOption, 
  onOptionSelect, 
  onSubmit,
  isSubmitted 
}: ScenarioOptionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Decision</CardTitle>
        <CardDescription>Select the best course of action</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup 
          value={selectedOption || ""} 
          onValueChange={onOptionSelect}
          disabled={isSubmitted}
        >
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={option.text} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`}>{option.text}</Label>
            </div>
          ))}
        </RadioGroup>

        <Button 
          onClick={onSubmit} 
          disabled={!selectedOption || isSubmitted}
          className="w-full"
        >
          Submit Decision
        </Button>
      </CardContent>
    </Card>
  )
} 