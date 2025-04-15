import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/auth.config'
import connectDB from "@/lib/mongodb"
import { User } from "@/app/models/User"

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { theme } = body

    if (!theme || !['light', 'dark', 'system'].includes(theme)) {
      return NextResponse.json(
        { error: "Invalid theme value" },
        { status: 400 }
      )
    }

    await connectDB()

    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    user.theme = theme
    await user.save()

    return NextResponse.json({ message: "Theme updated successfully" })
  } catch (error) {
    console.error("Error updating theme:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update theme" },
      { status: 500 }
    )
  }
} 