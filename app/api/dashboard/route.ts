import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { UserProgress } from '@/app/models/user-progress'
import { Scenario } from '@/app/models/Scenario'
import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'

interface UserDecision {
  id: string
  created_at: string
  total_score: number
  scenarios: {
    title: string
    category: string
  }
  scenario_options: {
    title: string
  }
}

interface CompletedScenario {
  scenario_id: string
  completed_at: string
  is_correct: boolean
  option_chosen: string
}

interface DailyChallenge {
  _id: mongoose.Types.ObjectId
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
}

interface Decision {
  scenario_id: string;
  option_chosen: string;
  is_correct: boolean;
  completed_at: Date;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Get user progress data
    const userProgress = await UserProgress.findOne({ user_id: session.user.id })
    if (!userProgress) {
      return NextResponse.json({ error: 'User progress not found' }, { status: 404 })
    }

    // Get today's daily challenges
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dailyChallenges = await Scenario.find({
      type: 'daily_challenge',
      active_date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }).limit(3)

    // Get user's recent decisions
    const recentDecisions = userProgress.decisions?.slice(-5) || []

    // Calculate challenge progress
    const challengeProgress = dailyChallenges.map(challenge => {
      const decision = userProgress.decisions?.find((d: Decision) => d.scenario_id.toString() === challenge._id.toString())
      return decision ? 100 : 0
    })

    const dashboardData = {
      profile: {
        level: userProgress.level || 1,
        xp: userProgress.xp || 0,
        rationality_score: userProgress.rationality_score || 0,
        decisiveness_score: userProgress.decisiveness_score || 0,
        completed_scenarios: userProgress.completed_scenarios || [],
        streak: userProgress.streak || 0
      },
      scenarios: [], // We'll fetch these when needed
      userDecisions: recentDecisions,
      dailyChallenges,
      challengeProgress
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
} 