'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { UserStats } from "@/components/user-stats"
import { RecentDecisions } from "@/components/recent-decisions"
import { DailyChallenge } from "@/components/daily-challenge"
import { Brain, Target, Award, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface DashboardContentProps {
  user: {
    id: string
    email: string
    user_metadata: {
      full_name?: string
      username?: string
    }
  }
}

interface DashboardData {
  profile: {
    level: number
    xp: number
    rationality_score: number
    decisiveness_score: number
    completed_scenarios: any[]
    streak: number
  }
  scenarios: any[]
  userDecisions: any[]
  dailyChallenges: {
    _id: string
    id: string
    title: string
    description: string
    category: string
    content: string
    options: {
      text: string
      is_correct: boolean
      feedback: string
    }[]
    active_date: string
    difficulty: string
    xp_reward: number
  }[]
  challengeProgress: number[]
}

export function DashboardContent({ user }: DashboardContentProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0)
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        
        // First, try to initialize user progress if it doesn't exist
        const initResponse = await fetch('/api/user-progress/init', {
          method: 'POST'
        })
        
        if (!initResponse.ok) {
          const initError = await initResponse.json()
          throw new Error(initError.error || 'Failed to initialize user progress')
        }

        // Then fetch dashboard data
        const response = await fetch('/api/dashboard')
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch dashboard data')
        }
        
        setDashboardData(data)
        setError(null)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        setError(error instanceof Error ? error.message : 'Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleStartChallenge = (challenge: any) => {
    // Store the challenge in localStorage for the challenge component
    localStorage.setItem('currentChallenge', JSON.stringify(challenge))
    // Navigate to the challenge page
    router.push('/challenge')
  }

  const getActiveChallenges = (challenges: DashboardData['dailyChallenges'], progress: number[]) => {
    return challenges.filter((_, index) => progress[index] !== 100)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-red-500 text-center">
          <p className="font-semibold">Error loading dashboard</p>
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No data available</p>
      </div>
    )
  }

  const { profile, userDecisions, dailyChallenges, challengeProgress } = dashboardData
  const activeChallenges = getActiveChallenges(dailyChallenges, challengeProgress)
  const totalChallenges = activeChallenges.length
  const currentChallenge = activeChallenges[currentChallengeIndex]

  const handlePrevious = () => {
    setCurrentChallengeIndex((prev) => (prev > 0 ? prev - 1 : prev))
  }

  const handleNext = () => {
    setCurrentChallengeIndex((prev) => (prev < totalChallenges - 1 ? prev + 1 : prev))
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.user_metadata?.full_name || user.user_metadata?.username || "User"}! Track your decision-making progress.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm py-1 px-3 flex items-center gap-1">
            <Brain className="h-3 w-3" />
            <span>
              Level {profile.level || 1}:{" "}
              {profile.level === 1
                ? "Novice"
                : profile.level === 2
                  ? "Thinker"
                  : profile.level === 3
                    ? "Strategist"
                    : "Sage"}
            </span>
          </Badge>
          <Badge variant="outline" className="text-sm py-1 px-3 flex items-center gap-1">
            <Award className="h-3 w-3" />
            <span>{profile.xp || 0} XP</span>
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rationality Score</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.rationality_score || 0}/100</div>
            <Progress value={profile.rationality_score || 0} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Decisiveness</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.decisiveness_score || 0}/100</div>
            <Progress value={profile.decisiveness_score || 0} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scenarios Completed</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.completed_scenarios?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Keep going!</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 6h.01" />
              <path d="M2 12h.01" />
              <path d="M5 15h.01" />
              <path d="M9 18h.01" />
              <path d="M15 9h.01" />
              <path d="M18 5h.01" />
              <path d="M21 13h.01" />
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.streak || 0} days</div>
            <p className="text-xs text-muted-foreground mt-1">Keep it going!</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Decisions</CardTitle>
            <CardDescription>Your latest decision-making exercises</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentDecisions decisions={userDecisions} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Daily Challenges</CardTitle>
                <CardDescription>Complete today's challenges to earn bonus XP</CardDescription>
              </div>
              <Badge variant="outline" className="text-sm px-2 min-w-[48px] text-center">
                {totalChallenges > 0 ? `${currentChallengeIndex + 1}/${totalChallenges}` : '0/0'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {totalChallenges > 0 ? (
              <div className="space-y-4">
                <div key={currentChallenge._id} className="border rounded-lg p-4 min-h-[250px] flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{currentChallenge.title}</h3>
                      <p className="text-sm text-muted-foreground">{currentChallenge.category}</p>
                    </div>
                    <Badge variant={
                      currentChallenge.difficulty === 'easy' ? 'default' :
                      currentChallenge.difficulty === 'medium' ? 'secondary' : 'destructive'
                    }>
                      {currentChallenge.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 min-h-[40px]">{currentChallenge.description}</p>
                  <div className="space-y-2 mt-auto">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{challengeProgress[dailyChallenges.indexOf(currentChallenge)]}%</span>
                    </div>
                    <Progress 
                      value={challengeProgress[dailyChallenges.indexOf(currentChallenge)]} 
                      className="h-2" 
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {challengeProgress[dailyChallenges.indexOf(currentChallenge)] === 100 ? 
                          'Completed' : 
                          `${currentChallenge.xp_reward} XP`
                        }
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={handlePrevious}
                          disabled={currentChallengeIndex === 0}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M15 18l-6-6 6-6" />
                          </svg>
                        </Button>
                        <Button 
                          onClick={() => handleStartChallenge(currentChallenge)}
                          disabled={challengeProgress[dailyChallenges.indexOf(currentChallenge)] === 100}
                        >
                          Start Challenge
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={handleNext}
                          disabled={currentChallengeIndex === totalChallenges - 1}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 min-h-[250px] flex items-center justify-center">
                <p className="text-muted-foreground">
                  {dailyChallenges.length > 0 
                    ? 'All challenges completed! Check back tomorrow for new challenges.' 
                    : 'No challenges available today. Check back tomorrow!'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 