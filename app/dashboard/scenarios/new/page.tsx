'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { toast } from "sonner"

interface Option {
  text: string
  is_correct: boolean
}

export default function NewScenarioPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [xpReward, setXpReward] = useState("10")
  const [difficulty, setDifficulty] = useState("1")
  const [options, setOptions] = useState<Option[]>([
    { text: "", is_correct: false },
    { text: "", is_correct: false }
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const addOption = () => {
    setOptions([...options, { text: "", is_correct: false }])
  }

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index))
  }

  const updateOption = (index: number, field: keyof Option, value: string | boolean) => {
    const newOptions = [...options]
    newOptions[index] = { ...newOptions[index], [field]: value }
    setOptions(newOptions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Validate form
      if (!title || !description || !category || options.length < 2) {
        throw new Error("Please fill in all required fields and add at least 2 options")
      }

      if (options.some(opt => !opt.text)) {
        throw new Error("All options must have text")
      }

      if (!options.some(opt => opt.is_correct)) {
        throw new Error("At least one option must be marked as correct")
      }

      const response = await fetch('/api/scenarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          category,
          xp_reward: parseInt(xpReward),
          difficulty: parseInt(difficulty),
          options
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create scenario')
      }

      toast.success("Scenario created successfully!")
      router.push('/dashboard/scenarios')
    } catch (err) {
      console.error('Error creating scenario:', err)
      const errorMessage = err instanceof Error ? err.message : "Failed to create scenario"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard/scenarios">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Scenarios
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Scenario</CardTitle>
          <CardDescription>
            Design a new decision-making scenario with multiple options
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="min-h-[200px]"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="xpReward">XP Reward</Label>
                  <Input
                    id="xpReward"
                    type="number"
                    value={xpReward}
                    onChange={(e) => setXpReward(e.target.value)}
                    min={1}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulty (1-5)</Label>
                  <Input
                    id="difficulty"
                    type="number"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    min={1}
                    max={5}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Options</Label>
                <div className="space-y-4">
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-1">
                        <Input
                          placeholder={`Option ${index + 1}`}
                          value={option.text}
                          onChange={(e) => updateOption(index, 'text', e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`correct-${index}`}
                          checked={option.is_correct}
                          onChange={(e) => updateOption(index, 'is_correct', e.target.checked)}
                        />
                        <Label htmlFor={`correct-${index}`}>Correct</Label>
                      </div>
                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addOption}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Option
                  </Button>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Scenario"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 