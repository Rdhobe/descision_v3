import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import connectDB from '@/lib/mongodb'
import { Scenario } from '@/app/models/Scenario'
import { UserProgress } from '@/app/models/user-progress'

interface Option {
  text: string
  is_correct: boolean
  feedback?: string
  explanation?: string
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate content type
    const contentType = request.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      )
    }

    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // Validate required fields
    const { scenarioId, optionText } = body
    if (!scenarioId || !optionText) {
      return NextResponse.json(
        { error: 'Missing required fields: scenarioId and optionText' },
        { status: 400 }
      )
    }

    await connectDB()

    // Find the scenario
    const scenario = await Scenario.findById(scenarioId)
    if (!scenario) {
      return NextResponse.json(
        { error: 'Scenario not found' },
        { status: 404 }
      )
    }

    // Find the selected option
    const selectedOption = scenario.options.find(opt => opt.text === optionText)
    if (!selectedOption) {
      return NextResponse.json(
        { error: 'Invalid option selected' },
        { status: 400 }
      )
    }

    // Update scenario attempts
    scenario.attempts += 1
    if (selectedOption.is_correct) {
      scenario.successful_attempts += 1
    }
    await scenario.save()

    // Update user progress
    const userProgress = await UserProgress.findOne({ user_id: session.user.id })
    if (!userProgress) {
      return NextResponse.json(
        { error: 'User progress not found' },
        { status: 404 }
      )
    }

    // Check if user has already completed this scenario
    const existingCompletion = userProgress.completed_scenarios.find(
      s => s.scenario_id.toString() === scenarioId
    )

    if (!existingCompletion) {
      // Add to completed scenarios
      userProgress.completed_scenarios.push({
        scenario_id: scenario._id,
        option_chosen: optionText,
        is_correct: selectedOption.is_correct,
        completed_at: new Date()
      })

      // Award XP if correct
      if (selectedOption.is_correct) {
        userProgress.xp += scenario.xp_reward
        
        // Check for level up
        const xpForNextLevel = userProgress.level * 100
        if (userProgress.xp >= xpForNextLevel) {
          userProgress.level += 1
        }
      }

      await userProgress.save()
    }

    return NextResponse.json({
      isCorrect: selectedOption.is_correct,
      feedback: selectedOption.feedback,
      xpAwarded: selectedOption.is_correct && !existingCompletion ? scenario.xp_reward : 0,
      level: userProgress.level
    })
  } catch (error) {
    console.error('Error processing scenario response:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 