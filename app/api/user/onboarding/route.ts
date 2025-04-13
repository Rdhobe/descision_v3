import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { User } from '@/app/models/User'
import connectDB from '@/lib/mongodb'

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { mbtiType, decisionStyle, primaryBias } = body

    // Validate required fields
    if (!mbtiType || !decisionStyle || !primaryBias) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Connect to database
    await connectDB()

    // Update user profile
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        mbtiType,
        decisionStyle,
        primaryBias,
        onboardingCompleted: true,
        updatedAt: new Date()
      },
      { new: true }
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      message: 'Onboarding completed successfully',
      user: {
        email: user.email,
        mbtiType: user.mbtiType,
        decisionStyle: user.decisionStyle,
        primaryBias: user.primaryBias,
        onboardingCompleted: user.onboardingCompleted
      }
    })
  } catch (error) {
    console.error('Error updating user onboarding:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 