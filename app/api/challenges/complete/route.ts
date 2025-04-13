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
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { challengeId } = body

    if (!challengeId) {
      return NextResponse.json({ error: 'Challenge ID is required' }, { status: 400 })
    }

    await connectDB()

    // Get user progress
    const userProgress = await UserProgress.findOne({ user_id: session.user.id })
    if (!userProgress) {
      return NextResponse.json({ error: 'User progress not found' }, { status: 404 })
    }

    // Check if challenge is already completed
    const isCompleted = userProgress.decisions?.some((d: Decision) => d.scenario_id.toString() === challengeId)
    if (isCompleted) {
      return NextResponse.json({ error: 'Challenge already completed' }, { status: 400 })
    }

    // Add challenge to completed list and update XP
    const now = new Date()
    userProgress.decisions = userProgress.decisions || []
    userProgress.decisions.push({
      scenario_id: challengeId,
      completed_at: now,
      is_correct: true, // Since this is just for completing the challenge
      option_chosen: 'completed'
    })

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
    userProgress.xp = (userProgress.xp || 0) + 50 // Default XP reward

    await userProgress.save()

    return NextResponse.json({
      message: 'Challenge completed successfully',
      userProgress
    })
  } catch (error) {
    console.error('Error completing challenge:', error)
    return NextResponse.json(
      { error: 'Failed to complete challenge' },
      { status: 500 }
    )
  }
} 