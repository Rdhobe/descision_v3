import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import connectDB from '@/lib/mongodb'
import { UserProgress } from '@/app/models/user-progress'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    // Check if user progress already exists
    const existingProgress = await UserProgress.findOne({ user_id: session.user.id })
    if (existingProgress) {
      return NextResponse.json({ message: 'User progress already initialized' })
    }

    // Create new user progress
    const userProgress = new UserProgress({
      user_id: session.user.id,
      xp: 0,
      level: 1,
      streak: 0,
      completed_scenarios: [],
      rationality_score: 0,
      empathy_score: 0,
      clarity_score: 0,
      decisiveness_score: 0
    })

    await userProgress.save()

    return NextResponse.json({ message: 'User progress initialized successfully' })
  } catch (error) {
    console.error('Error initializing user progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 