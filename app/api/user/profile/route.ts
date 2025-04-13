import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import { User } from "@/app/models/User"
import connectDB from "@/lib/mongodb"

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { mbtiType, decisionStyle, primaryBias } = body

    if (!mbtiType || !decisionStyle || !primaryBias) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    await connectDB()

    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        $set: {
          mbtiType,
          decisionStyle,
          primaryBias,
          updatedAt: new Date(),
          onboardingCompleted: true
        }
      },
      { new: true }
    )

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        email: user.email,
        mbtiType: user.mbtiType,
        decisionStyle: user.decisionStyle,
        primaryBias: user.primaryBias,
        onboardingCompleted: user.onboardingCompleted
      }
    })

  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 