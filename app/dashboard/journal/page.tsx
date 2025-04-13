"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Brain, BookOpen, Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { format } from "date-fns"

interface JournalEntry {
  _id: string
  date: string
  context: string
  options: string
  decision: string
  reflection: string
  createdAt: string
}

export default function JournalPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [context, setContext] = useState("")
  const [options, setOptions] = useState("")
  const [decision, setDecision] = useState("")
  const [reflection, setReflection] = useState("")
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/journal')
      if (!response.ok) throw new Error('Failed to fetch entries')
      const data = await response.json()
      setEntries(data)
    } catch (error) {
      console.error('Error fetching entries:', error)
      toast.error('Failed to load journal entries')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!date || !context || !options || !decision || !reflection) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          context,
          options,
          decision,
          reflection,
        }),
      })

      if (!response.ok) throw new Error('Failed to create entry')

      toast.success('Journal entry created successfully')
      setContext('')
      setOptions('')
      setDecision('')
      setReflection('')
      fetchEntries()
    } catch (error) {
      console.error('Error creating entry:', error)
      toast.error('Failed to create journal entry')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Decision Journal</h1>
        <p className="text-muted-foreground">
          Reflect on your decisions and track your thought process
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>New Entry</CardTitle>
            <CardDescription>
              Document your decision-making process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Decision Context</label>
              <Textarea
                placeholder="Describe the situation and context of your decision..."
                className="min-h-[100px]"
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Options Considered</label>
              <Textarea
                placeholder="List the options you considered..."
                className="min-h-[100px]"
                value={options}
                onChange={(e) => setOptions(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Decision Made</label>
              <Textarea
                placeholder="What decision did you make and why?"
                className="min-h-[100px]"
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reflection</label>
              <Textarea
                placeholder="How do you feel about the decision now? What would you do differently?"
                className="min-h-[100px]"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleSubmit}>
              <Plus className="mr-2 h-4 w-4" />
              Add Entry
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Entries</CardTitle>
              <CardDescription>
                Your latest decision journal entries
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : entries.length === 0 ? (
                <p className="text-center text-muted-foreground">No entries yet</p>
              ) : (
                entries.map((entry) => (
                  <div key={entry._id} className="rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-primary/10 p-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">
                          {format(new Date(entry.date), 'MMMM d, yyyy')}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(entry.createdAt), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {entry.context}
                    </p>
                    <Button variant="ghost" className="mt-2">
                      Read More
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Insights</CardTitle>
              <CardDescription>
                Patterns and learnings from your decisions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-blue-100 p-2">
                  <Brain className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Common Decision Patterns</h4>
                  <p className="text-sm text-muted-foreground">
                    {entries.length > 0
                      ? "Analyzing your decision patterns..."
                      : "Start adding entries to see insights"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-green-100 p-2">
                  <Brain className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Areas of Improvement</h4>
                  <p className="text-sm text-muted-foreground">
                    {entries.length > 0
                      ? "Identifying areas for growth..."
                      : "Add more entries to get personalized insights"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 