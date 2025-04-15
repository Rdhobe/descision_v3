import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/auth.config'
import connectDB from "@/lib/mongodb"
import { User } from "@/app/models/User"
import bcrypt from "bcryptjs"

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "You must be logged in to change your password" }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Please provide both your current password and new password" },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Your new password must be at least 6 characters long" },
        { status: 400 }
      )
    }

    await connectDB()

    const user = await User.findById(session.user.id).select('+password')
    if (!user) {
      return NextResponse.json({ error: "User account not found" }, { status: 404 })
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({ error: "The current password you entered is incorrect" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedPassword
    await user.save()

    return NextResponse.json({ 
      message: "Your password has been successfully updated",
      success: true 
    })
  } catch (error) {
    console.error("Error updating password:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred while updating your password" },
      { status: 500 }
    )
  }
} 