import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/auth.config'
import connectDB from "@/lib/mongodb"
import { User } from "@/app/models/User"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      name: user.name,
      email: user.email,
      mbtiType: user.mbtiType,
      decisionStyle: user.decisionStyle,
      primaryBias: user.primaryBias,
      theme: user.theme,
      language: user.language
    })
  } catch (error) {
    console.error("Error fetching user settings:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch user settings" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, mbtiType, decisionStyle, primaryBias } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    await connectDB()

    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    user.name = name
    user.mbtiType = mbtiType
    user.decisionStyle = decisionStyle
    user.primaryBias = primaryBias

    await user.save()

    return NextResponse.json({ message: "Account settings updated successfully" })
  } catch (error) {
    console.error("Error updating account settings:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update account settings" },
      { status: 500 }
    )
  }
} 