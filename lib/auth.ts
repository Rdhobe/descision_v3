"use server"

import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "./auth.config"
import { User } from "@/app/models/User"
import connectDB from "@/lib/mongodb"

export async function getAuthSession() {
  return await getServerSession(authOptions)
}

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function getUserProfile() {
  const session = await getSession()

  if (!session?.user) {
    return null
  }

  await connectDB()
  const profile = await User.findById(session.user.id).select("-password")
  return profile
}

export async function requireAuth() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return session
}
