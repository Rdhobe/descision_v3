import { NextResponse } from 'next/server'
import { Scenario, IScenario } from '@/app/models/Scenario'
import connectDB from '@/lib/mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'

interface IOption {
  text: string
  is_correct: boolean
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');

    await connectDB();

    // Build query
    const query: any = { type: 'scenario' };
    if (category) query.category = category;
    if (difficulty) query.difficulty = parseInt(difficulty);

    // Get total count for pagination
    const total = await Scenario.countDocuments(query);

    // Fetch scenarios with pagination
    const scenarios = await Scenario.find(query)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-content'); // Don't send full content in list view

    return NextResponse.json({
      scenarios,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scenarios' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be logged in to create scenarios' },
        { status: 401 }
      );
    }

    // Validate content type
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredFields = ['title', 'description', 'category', 'options'];
    const missingFields = requiredFields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate options
    if (!Array.isArray(body.options) || body.options.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 options are required' },
        { status: 400 }
      );
    }

    // Validate that at least one option is correct
    const hasCorrectOption = body.options.some((option: IOption) => option.is_correct);
    if (!hasCorrectOption) {
      return NextResponse.json(
        { error: 'At least one option must be correct' },
        { status: 400 }
      );
    }

    // Create new scenario
    const scenario = new Scenario({
      ...body,
      type: 'scenario',
      created_by: session.user.id,
      created_at: new Date(),
      xp_reward: body.xp_reward || 10, // Default XP reward
      difficulty: body.difficulty || 'medium'
    });

    await scenario.save();

    return NextResponse.json({
      message: 'Scenario created successfully',
      scenario: {
        _id: scenario._id,
        title: scenario.title,
        description: scenario.description,
        category: scenario.category,
        xp_reward: scenario.xp_reward,
        difficulty: scenario.difficulty,
        created_at: scenario.created_at
      }
    });
  } catch (error) {
    console.error('Error creating scenario:', error);
    return NextResponse.json(
      { error: 'Failed to create scenario' },
      { status: 500 }
    );
  }
} 