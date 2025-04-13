import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import connectDB from "@/lib/mongodb"
import { User } from "@/app/models/User"
import { UserProgress } from "@/app/models/user-progress"
import { Scenario } from "@/app/models/Scenario"
import mongoose from 'mongoose'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      console.error("Unauthorized access attempt to activities API")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Connecting to MongoDB...")
    await connectDB()

    console.log("Fetching recent scenarios...")
    const recentScenarios = await Scenario.find()
      .sort({ created_at: -1 })
      .limit(10)
    console.log(`Found ${recentScenarios.length} recent scenarios`)

    // Get user names for scenarios
    const creatorIds = recentScenarios.map(s => s.creator_id)
    const validCreatorIds = creatorIds.filter(id => mongoose.Types.ObjectId.isValid(id))
    const creators = await User.find({ _id: { $in: validCreatorIds } }, 'name')
    const creatorMap = new Map(creators.map(c => [c._id.toString(), c.name]))

    console.log("Fetching recent progress...")
    const recentProgress = await UserProgress.find()
      .sort({ updated_at: -1 })
      .limit(10)
    console.log(`Found ${recentProgress.length} recent progress records`)

    // Get user names for progress
    const userIds = recentProgress.map(p => p.user_id)
    const validUserIds = userIds.filter(id => mongoose.Types.ObjectId.isValid(id))
    const users = await User.find({ _id: { $in: validUserIds } }, 'name')
    const userMap = new Map(users.map(u => [u._id.toString(), u.name]))

    // Combine and format activities
    const activities = [
      ...recentScenarios.map(scenario => ({
        _id: scenario._id,
        user_id: scenario.creator_id,
        user_name: creatorMap.get(scenario.creator_id) || 'Unknown User',
        type: 'scenario_completed',
        details: `Created a new scenario: ${scenario.title}`,
        created_at: scenario.created_at
      })),
      ...recentProgress
        .filter(progress => mongoose.Types.ObjectId.isValid(progress.user_id))
        .map(progress => ({
          _id: progress._id,
          user_id: progress.user_id,
          user_name: userMap.get(progress.user_id) || 'Unknown User',
          type: 'level_up',
          details: `Reached level ${progress.level}`,
          created_at: progress.updated_at
        }))
    ]

    // Sort by date (descending)
    activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    console.log(`Returning ${activities.length} activities`)
    return NextResponse.json({ activities })
  } catch (error) {
    console.error("Error in activities API:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch activities" },
      { status: 500 }
    )
  }
} 