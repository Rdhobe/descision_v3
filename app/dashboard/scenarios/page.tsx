'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Brain, Target, Award, Search, Plus, Users } from "lucide-react"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import ShareScenarioButton from '@/components/ShareScenarioButton'

interface Scenario {
  _id: string
  title: string
  description: string
  category: string
  xp_reward: number
  difficulty: string
  created_at: string
  created_by?: string
  attempts?: number
}

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const response = await fetch('/api/scenarios')
        if (!response.ok) {
          throw new Error('Failed to fetch scenarios')
        }
        const data = await response.json()
        setScenarios(data.scenarios || [])
      } catch (error) {
        console.error('Error fetching scenarios:', error)
        toast.error('Failed to load scenarios')
      } finally {
        setIsLoading(false)
      }
    }

    fetchScenarios()
  }, [])

  const handleCreateNewScenario = () => {
    if (!session) {
      toast.error('Please sign in to create scenarios')
      router.push('/auth/signin')
      return
    }
    router.push('/dashboard/scenarios/new')
  }

  const filteredScenarios = scenarios.filter(scenario =>
    scenario.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scenario.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scenario.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">Decision Scenarios</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search scenarios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <Button onClick={handleCreateNewScenario} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Create New Scenario
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScenarios.map((scenario) => (
          <Card key={scenario._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>{scenario.title}</CardTitle>
                  <CardDescription>{scenario.category}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{scenario.description}</p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <span>{scenario.xp_reward} XP</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-blue-500" />
                  <span>Difficulty: {scenario.difficulty}</span>
                </div>
              </div>
              {session?.user?.id === scenario.created_by && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{scenario.attempts || 0} attempts</span>
                </div>
              )}
              <div className="flex gap-2">
                <Button className="flex-1" asChild>
                  <Link href={`/dashboard/scenarios/${scenario._id}`}>
                    Start Scenario
                  </Link>
                </Button>
                <ShareScenarioButton
                  scenarioId={scenario._id}
                  scenarioType="scenario"
                  scenarioData={{
                    title: scenario.title,
                    description: scenario.description,
                    category: scenario.category,
                    difficulty: parseInt(scenario.difficulty),
                    xp_reward: scenario.xp_reward
                  }}
                  size="icon"
                  variant="outline"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 