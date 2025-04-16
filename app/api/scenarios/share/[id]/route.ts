import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { Scenario } from '@/app/models/Scenario';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate ID format
    if (!params.id || !mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid scenario ID format' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const scenario = await Scenario.findById(params.id);
    
    if (!scenario) {
      return NextResponse.json(
        { message: 'Scenario not found' },
        { status: 404 }
      );
    }

    // Return only the fields needed for sharing
    return NextResponse.json({
      _id: scenario._id,
      title: scenario.title,
      description: scenario.description,
      category: scenario.category,
      difficulty: scenario.difficulty,
      xp_reward: scenario.xp_reward,
      type: scenario.type
    });
  } catch (error) {
    console.error('Error fetching scenario for sharing:', error);
    return NextResponse.json(
      { message: 'Failed to fetch scenario' },
      { status: 500 }
    );
  }
} 