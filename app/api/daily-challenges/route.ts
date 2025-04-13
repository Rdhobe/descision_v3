import { NextResponse } from 'next/server'
import { Scenario } from '@/app/models/Scenario'
import connectDB from '@/lib/mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'

export async function GET() {
  try {
    await connectDB()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Fetch today's daily challenges
    const dailyChallenges = await Scenario.find({
      type: 'daily_challenge',
      active_date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }).limit(3) // Limit to 3 daily challenges

    return NextResponse.json(dailyChallenges)
  } catch (error) {
    console.error('Error fetching daily challenges:', error)
    return NextResponse.json({ error: 'Failed to fetch daily challenges' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication and admin status
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Add admin check here
    // if (!isAdmin(session.user.id)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    // }

    const contentType = request.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      )
    }

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
    if (!body.title || !body.description || !body.category || !body.options || !body.active_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!Array.isArray(body.options) || body.options.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 options are required' },
        { status: 400 }
      )
    }

    interface Option {
      text: string;
      is_correct: boolean;
    }

    if (!body.options.some((opt: Option) => opt.is_correct)) {
      return NextResponse.json(
        { error: 'At least one option must be marked as correct' },
        { status: 400 }
      )
    }

    await connectDB()
    
    const challengeData = {
      ...body,
      creator_id: session.user.id,
      content: body.description,
      type: 'daily_challenge',
      created_at: new Date(),
      updated_at: new Date()
    }
    
    const challenge = new Scenario(challengeData)
    const savedChallenge = await challenge.save()
    return NextResponse.json(savedChallenge)
  } catch (error) {
    console.error('Error creating daily challenge:', error)
    return NextResponse.json(
      { error: 'Failed to create daily challenge' },
      { status: 500 }
    )
  }
} 