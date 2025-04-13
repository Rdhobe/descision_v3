import { NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { JournalEntry } from '@/app/models/journal'

export async function GET() {
  try {
    const session = await getAuthSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const entries = await JournalEntry.find({ userId: session.user.email })
      .sort({ date: -1 })
      .limit(10)

    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error fetching journal entries:', error)
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { date, context, options, decision, reflection } = await request.json()
    
    if (!date || !context || !options || !decision || !reflection) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await connectDB()
    const entry = new JournalEntry({
      userId: session.user.email,
      date: new Date(date),
      context,
      options,
      decision,
      reflection
    })

    await entry.save()
    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error creating journal entry:', error)
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 })
  }
} 