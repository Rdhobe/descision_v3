'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Trophy, Users, Activity, Star, Target } from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

interface UserProfile {
  _id: string
  name: string
  email: string
  level: number
  xp: number
  streak: number
  completed_scenarios: number
  rationality_score: number
  decisiveness_score: number
  mbtiType?: string
  decisionStyle?: string
  primaryBias?: string
}

interface Activity {
  _id: string
  user_id: string
  user_name: string
  type: 'scenario_completed' | 'level_up' | 'achievement_unlocked'
  details: string
  created_at: string
}

export default function CommunityPage() {
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { data: session } = useSession()

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        const [profilesRes, activitiesRes] = await Promise.all([
          fetch('/api/community/profiles'),
          fetch('/api/community/activities')
        ])

        if (!profilesRes.ok) {
          const errorData = await profilesRes.json()
          throw new Error(`Profiles API error: ${errorData.error || profilesRes.statusText}`)
        }

        if (!activitiesRes.ok) {
          const errorData = await activitiesRes.json()
          throw new Error(`Activities API error: ${errorData.error || activitiesRes.statusText}`)
        }

        const profilesData = await profilesRes.json()
        const activitiesData = await activitiesRes.json()

        if (!profilesData.profiles || !activitiesData.activities) {
          throw new Error('Invalid response format from API')
        }

        setProfiles(profilesData.profiles)
        setActivities(activitiesData.activities)
      } catch (error) {
        console.error('Error fetching community data:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to load community data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCommunityData()
  }, [])

  const filteredProfiles = profiles.filter(profile =>
    profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.email.toLowerCase().includes(searchQuery.toLowerCase())
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
        <h1 className="text-3xl font-bold">Community</h1>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
          {activities.map((activity) => (
            <Card key={activity._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    {activity.type === 'scenario_completed' && <Target className="h-5 w-5 text-primary" />}
                    {activity.type === 'level_up' && <Star className="h-5 w-5 text-primary" />}
                    {activity.type === 'achievement_unlocked' && <Trophy className="h-5 w-5 text-primary" />}
                  </div>
                  <div>
                    <p className="font-medium">{activity.user_name}</p>
                    <p className="text-sm text-muted-foreground">{activity.details}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Community Members */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Top Members</h2>
          {filteredProfiles.map((profile) => (
            <Card key={profile._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{profile.name}</p>
                    <p className="text-sm text-muted-foreground">Level {profile.level}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span>{profile.xp} XP</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <span>{profile.streak} day streak</span>
                      </div>
                    </div>
                    {profile.mbtiType && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground">
                          MBTI: {profile.mbtiType} • Style: {profile.decisionStyle}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 