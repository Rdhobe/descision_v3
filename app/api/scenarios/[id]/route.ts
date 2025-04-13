import { NextResponse } from 'next/server'
import { Scenario } from '@/app/models/Scenario'
import connectDB from '@/lib/mongodb'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID format
    if (!params.id || params.id.length !== 24) {
      return NextResponse.json(
        { error: 'Invalid scenario ID format' },
        { status: 400 }
      )
    }

    await connectDB()
    
    const scenario = await Scenario.findById(params.id)
    
    if (!scenario) {
      return NextResponse.json(
        { message: 'Scenario not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(scenario)
  } catch (error) {
    console.error('Error fetching scenario:', error)
    return NextResponse.json(
      { message: 'Failed to fetch scenario' },
      { status: 500 }
    )
  }
} 