import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { UserProgress } from '@/app/models/user-progress'
import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'

export async function POST(request: Request) {
  try {
    // Get session
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Connect to MongoDB
    await connectDB()

    // Parse request body
    const { challengeId, optionChosen, isCorrect, xpReward } = await request.json()

    // Validate challengeId
    if (!mongoose.Types.ObjectId.isValid(challengeId)) {
      return NextResponse.json({ error: 'Invalid challenge ID' }, { status: 400 })
    }

    // Get user progress
    const userProgress = await UserProgress.findOne({ user_id: session.user.id })
    if (!userProgress) {
      return NextResponse.json({ error: 'User progress not found' }, { status: 404 })
    }

    // Update user progress
    const now = new Date()
    
    // Add completed scenario
    if (!userProgress.completed_scenarios) {
      userProgress.completed_scenarios = []
    }
    
    // Check if scenario is already completed
    const alreadyCompleted = userProgress.completed_scenarios.some(
      scenario => scenario.scenario_id.toString() === challengeId
    )

    if (alreadyCompleted) {
      return NextResponse.json({ 
        error: 'Challenge already completed',
        newXP: userProgress.xp,
        newLevel: userProgress.level,
        rationality_score: userProgress.rationality_score,
        decisiveness_score: userProgress.decisiveness_score,
        streak: userProgress.streak
      })
    }

    // Add new completion
    userProgress.completed_scenarios.push({
      scenario_id: new mongoose.Types.ObjectId(challengeId),
      completed_at: now,
      is_correct: isCorrect,
      option_chosen: optionChosen
    })

    // Update XP and calculate new level
    const currentXP = userProgress.xp || 0
    const newXP = currentXP + xpReward
    userProgress.xp = newXP

    // Calculate new level (every 500 XP = 1 level)
    const newLevel = Math.floor(newXP / 500) + 1
    if (newLevel !== userProgress.level) {
      userProgress.level = newLevel
    }

    // Update rationality score (weighted average of correct answers)
    const totalScenarios = userProgress.completed_scenarios.length
    const correctScenarios = userProgress.completed_scenarios.filter(s => s.is_correct).length
    userProgress.rationality_score = Math.round((correctScenarios / totalScenarios) * 100)

    // Update decisiveness score (based on completion rate)
    const today = new Date()
    const last30Days = new Date(today.setDate(today.getDate() - 30))
    const recentScenarios = userProgress.completed_scenarios.filter(
      s => new Date(s.completed_at) >= last30Days
    ).length
    userProgress.decisiveness_score = Math.min(100, Math.round((recentScenarios / 30) * 100))

    // Update streak
    const lastCompletion = userProgress.completed_scenarios
      .map(s => new Date(s.completed_at))
      .sort((a, b) => b.getTime() - a.getTime())[1] // Get second-to-last completion

    if (lastCompletion) {
      const daysSinceLastCompletion = Math.floor(
        (now.getTime() - lastCompletion.getTime()) / (1000 * 60 * 60 * 24)
      )
      
      if (daysSinceLastCompletion <= 1) {
        userProgress.streak = (userProgress.streak || 0) + 1
      } else {
        userProgress.streak = 1
      }
    } else {
      userProgress.streak = 1
    }

    // Save updates
    await userProgress.save()

    return NextResponse.json({
      success: true,
      newXP,
      newLevel: userProgress.level,
      rationality_score: userProgress.rationality_score,
      decisiveness_score: userProgress.decisiveness_score,
      streak: userProgress.streak
    })
  } catch (error) {
    console.error('Error completing challenge:', error)
    return NextResponse.json({ 
      error: 'Failed to complete challenge',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 