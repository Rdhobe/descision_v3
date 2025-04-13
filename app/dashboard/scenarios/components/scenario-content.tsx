'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Award, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface ScenarioContentProps {
  title: string
  description: string
  content: string
  xpReward: number
  difficulty: number
}

export function ScenarioContent({ 
  title, 
  description, 
  content,
  xpReward,
  difficulty 
}: ScenarioContentProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/scenarios">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Award className="h-4 w-4 text-yellow-500" />
            <span className="text-sm">{xpReward} XP</span>
          </div>
          <div className="flex items-center gap-1">
            <Brain className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Difficulty: {difficulty}/5</span>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scenario Details</CardTitle>
          <CardDescription>Security Decision Making</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{description}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Context</h3>
            <p className="text-muted-foreground">{content}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 