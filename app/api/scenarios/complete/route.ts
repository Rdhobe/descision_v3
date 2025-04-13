import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import connectDB from '@/lib/mongodb'
import { UserProgress } from '@/app/models/user-progress'

interface Decision {
  scenario_id: string;
  option_chosen: string;
  is_correct: boolean;
  completed_at: Date;
  reflection?: string;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { scenarioId, optionIndex, reflection, totalScore, xpEarned, scores } = body

    if (!scenarioId || optionIndex === undefined || !scores) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await connectDB()

    // Get user progress
    const userProgress = await UserProgress.findOne({ user_id: session.user.id })
    if (!userProgress) {
      return NextResponse.json({ error: 'User progress not found' }, { status: 404 })
    }

    // Check if scenario is already completed
    const isCompleted = userProgress.decisions?.some((d: Decision) => d.scenario_id.toString() === scenarioId)
    if (isCompleted) {
      return NextResponse.json({ error: 'Scenario already completed' }, { status: 400 })
    }

    // Add scenario to completed list and update scores
    const now = new Date()
    userProgress.decisions = userProgress.decisions || []
    userProgress.decisions.push({
      scenario_id: scenarioId,
      completed_at: now,
      is_correct: true, // Since this is a decision-based scenario
      option_chosen: optionIndex.toString(),
      reflection: reflection
    })

    // Update scores using weighted average (20% weight for new scores)
    const weight = 0.2
    userProgress.rationality_score = Math.round(
      ((userProgress.rationality_score || 0) * (1 - weight) + scores.rationality * weight) * 100
    ) / 100

    userProgress.decisiveness_score = Math.round(
      ((userProgress.decisiveness_score || 0) * (1 - weight) + scores.decisiveness * weight) * 100
    ) / 100

    // Update streak if needed
    const lastActivityDate = userProgress.last_activity_date || new Date(0)
    const daysSinceLastActivity = Math.floor((now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSinceLastActivity === 0) {
      // Same day, no streak update needed
    } else if (daysSinceLastActivity === 1) {
      // Next day, increment streak
      userProgress.streak = (userProgress.streak || 0) + 1
    } else {
      // More than one day gap, reset streak
      userProgress.streak = 1
    }

    userProgress.last_activity_date = now
    userProgress.xp = (userProgress.xp || 0) + xpEarned

    await userProgress.save()

    return NextResponse.json({
      message: 'Scenario completed successfully',
      userProgress
    })
  } catch (error) {
    console.error('Error completing scenario:', error)
    return NextResponse.json(
      { error: 'Failed to complete scenario' },
      { status: 500 }
    )
  }
} 