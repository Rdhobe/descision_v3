import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import connectDB from '@/lib/mongodb'
import { UserProgress } from '@/app/models/user-progress'
import mongoose from 'mongoose'

interface CompletedScenario {
  completed_at: Date
  is_correct: boolean
}

interface MonthlyData {
  total: number
  count: number
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const userProgress = await UserProgress.findOne({ user_id: session.user.id })

    if (!userProgress) {
      return NextResponse.json({ error: 'User progress not found' }, { status: 404 })
    }

    // Calculate overall score based on rationality and decisiveness
    const overallScore = Math.round((userProgress.rationality_score + userProgress.decisiveness_score) / 2)

    // Get the last 6 months of progress data
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const progressData = userProgress.completed_scenarios
      .filter((scenario: CompletedScenario) => scenario.completed_at >= sixMonthsAgo)
      .map((scenario: CompletedScenario) => ({
        date: scenario.completed_at.toISOString().split('T')[0],
        score: scenario.is_correct ? 100 : 0
      }))

    // Group by month and calculate average score
    const monthlyData = progressData.reduce((acc: Record<string, MonthlyData>, curr) => {
      const month = curr.date.substring(0, 7) // YYYY-MM
      if (!acc[month]) {
        acc[month] = { total: 0, count: 0 }
      }
      acc[month].total += curr.score
      acc[month].count += 1
      return acc
    }, {})

    const chartData = Object.entries(monthlyData).map(([month, data]) => ({
      name: new Date(month).toLocaleString('default', { month: 'short' }),
      score: Math.round(data.total / data.count)
    }))

    return NextResponse.json({
      overallScore,
      scenariosCompleted: userProgress.completed_scenarios.length,
      currentStreak: userProgress.streak,
      totalXP: userProgress.xp,
      level: userProgress.level,
      chartData
    })
  } catch (error) {
    console.error('Error fetching user progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 