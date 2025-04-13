'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Brain, Target, Award, Calendar, Trophy, Star, Zap, Medal, Crown, BookOpen } from "lucide-react"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface UserProfile {
  email: string;
  username: string;
  name: string;
  createdAt: string;
  level: number;
  xp: number;
  scenariosCompleted: number;
  streak: number;
  rationality_score: number;
  decisiveness_score: number;
  empathy_score: number;
  clarity_score: number;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Calculate XP needed for next level
  const getNextLevelXP = (currentLevel: number) => {
    return currentLevel * 1000; // Example: Each level requires level * 1000 XP
  };

  // Calculate progress to next level
  const getLevelProgress = (currentLevel: number, currentXP: number) => {
    const nextLevelXP = getNextLevelXP(currentLevel);
    const previousLevelXP = getNextLevelXP(currentLevel - 1);
    const progress = ((currentXP - previousLevelXP) / (nextLevelXP - previousLevelXP)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        setProfile(data.user);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const achievements = [
    {
      title: "First Decision",
      description: "Complete your first scenario",
      icon: Star,
      achieved: profile?.scenariosCompleted ? profile.scenariosCompleted > 0 : false,
    },
    {
      title: "Decision Streak",
      description: "Maintain a 7-day streak",
      icon: Zap,
      achieved: profile?.streak ? profile.streak >= 7 : false,
    },
    {
      title: "Master Thinker",
      description: "Reach level 5",
      icon: Crown,
      achieved: profile?.level ? profile.level >= 5 : false,
    },
    {
      title: "Wisdom Seeker",
      description: "Complete 50 scenarios",
      icon: BookOpen,
      achieved: profile?.scenariosCompleted ? profile.scenariosCompleted >= 50 : false,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          View your achievements and progress
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Your profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/avatars/01.png" />
                  <AvatarFallback>{profile?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={profile?.name || ''} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profile?.email || ''} readOnly />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Level Progress</CardTitle>
              <CardDescription>
                Your journey to mastery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl font-bold">Level {profile?.level || 1}</span>
                <span className="text-sm text-muted-foreground">
                  {profile?.xp || 0} / {getNextLevelXP(profile?.level || 1)} XP
                </span>
              </div>
              <Progress value={getLevelProgress(profile?.level || 1, profile?.xp || 0)} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                {getNextLevelXP(profile?.level || 1) - (profile?.xp || 0)} XP needed for next level
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Stats</CardTitle>
              <CardDescription>
                Overview of your account activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-muted-foreground" />
                  <span>Level</span>
                </div>
                <span className="font-medium">{profile?.level || 1}: {getLevelTitle(profile?.level || 1)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span>Total XP</span>
                </div>
                <span className="font-medium">{profile?.xp || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span>Scenarios Completed</span>
                </div>
                <span className="font-medium">{profile?.scenariosCompleted || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Member Since</span>
                </div>
                <span className="font-medium">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  }) : 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Decision Making Skills</CardTitle>
              <CardDescription>
                Your decision-making capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Rationality</span>
                    <span className="text-sm font-medium">{profile?.rationality_score || 0}/100</span>
                  </div>
                  <Progress value={profile?.rationality_score || 0} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Decisiveness</span>
                    <span className="text-sm font-medium">{profile?.decisiveness_score || 0}/100</span>
                  </div>
                  <Progress value={profile?.decisiveness_score || 0} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Empathy</span>
                    <span className="text-sm font-medium">{profile?.empathy_score || 0}/100</span>
                  </div>
                  <Progress value={profile?.empathy_score || 0} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Clarity</span>
                    <span className="text-sm font-medium">{profile?.clarity_score || 0}/100</span>
                  </div>
                  <Progress value={profile?.clarity_score || 0} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
          <CardDescription>
            Your earned badges and accomplishments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    achievement.achieved ? 'bg-primary/10 border-primary' : 'bg-muted/50 border-muted-foreground/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 ${
                      achievement.achieved ? 'bg-primary/20' : 'bg-muted'
                    }`}>
                      <Icon className={`h-4 w-4 ${
                        achievement.achieved ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-medium">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Streak</CardTitle>
          <CardDescription>
            Your consistency record
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-2">
              <Trophy className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{profile?.streak || 0} Days</h4>
                {profile?.streak && profile.streak >= 7 && (
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    🔥 On Fire!
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Keep your streak going by completing daily challenges
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getLevelTitle(level: number): string {
  const titles = {
    1: 'Novice',
    2: 'Thinker',
    3: 'Strategist',
    4: 'Expert',
    5: 'Master'
  };
  return titles[level as keyof typeof titles] || 'Unknown';
} 