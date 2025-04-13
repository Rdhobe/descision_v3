import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { User } from '@/app/models/User';
import { UserProgress } from '@/app/models/user-progress';
import connectDB from '@/lib/mongodb';

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email }).select('-password');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch user progress data
    const progress = await UserProgress.findOne({ user_id: user._id.toString() });

    // Combine user and progress data, preferring progress data for stats
    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        level: progress?.level || user.level || 1,
        xp: progress?.xp || user.xp || 0,
        scenariosCompleted: progress?.completed_scenarios?.length || 0,
        streak: progress?.streak || user.streak || 0,
        rationality_score: progress?.rationality_score || user.rationality_score || 0,
        decisiveness_score: progress?.decisiveness_score || user.decisiveness_score || 0,
        empathy_score: progress?.empathy_score || user.empathy_score || 0,
        clarity_score: progress?.clarity_score || user.clarity_score || 0,
        last_active: progress?.last_active || user.updatedAt
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 