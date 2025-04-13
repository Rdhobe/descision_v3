import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import connectDB from "@/lib/mongodb"
import { User } from "@/app/models/User"
import { UserProgress } from "@/app/models/user-progress"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      console.error("Unauthorized access attempt to profiles API")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Connecting to MongoDB...")
    await connectDB()

    console.log("Fetching users...")
    const users = await User.find({}, { password: 0 })
    console.log(`Found ${users.length} users`)

    console.log("Fetching user progress...")
    const userProgress = await UserProgress.find()
    console.log(`Found ${userProgress.length} progress records`)

    // Combine user data with progress data
    const profiles = users.map(user => {
      const progress = userProgress.find(p => p.user_id === user._id.toString())
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        level: progress?.level || 1,
        xp: progress?.xp || 0,
        streak: progress?.streak || 0,
        completed_scenarios: progress?.completed_scenarios || 0,
        rationality_score: progress?.rationality_score || 0,
        decisiveness_score: progress?.decisiveness_score || 0,
        mbtiType: user.mbtiType,
        decisionStyle: user.decisionStyle,
        primaryBias: user.primaryBias
      }
    })

    // Sort by XP (descending)
    profiles.sort((a, b) => b.xp - a.xp)

    console.log(`Returning ${profiles.length} profiles`)
    return NextResponse.json({ profiles })
  } catch (error) {
    console.error("Error in profiles API:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch profiles" },
      { status: 500 }
    )
  }
} 