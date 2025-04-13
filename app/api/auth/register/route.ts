import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import { User } from "@/app/models/User"
import mongoose from 'mongoose'
import { UserProgress } from '@/app/models/user-progress'

export async function POST(req: Request) {
  try {
    // Validate content type
    const contentType = req.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { message: 'Content-Type must be application/json' },
        { status: 400 }
      )
    }

    // Parse request body
    let body
    try {
      body = await req.json()
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { email, password, name } = body

    // Input validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { message: 'All fields are required: email, password, and name' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { message: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Connect to MongoDB
    await connectDB()
    console.log('MongoDB connection state:', mongoose.connection.readyState)

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { 
          message: 'An account with this email already exists',
          suggestion: 'Please try logging in instead'
        },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)
    console.log('Password hashing:', {
      original: password,
      hashed: hashedPassword
    })

    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      name,
      username: null,
      xp: 0,
      level: 1,
      streak: 0,
      rationality_score: 0,
      empathy_score: 0,
      clarity_score: 0,
      decisiveness_score: 0,
    })

    // Save the user and get the result
    const savedUser = await user.save()
    
    // Verify the user was saved with password
    const verifiedUser = await User.findById(savedUser._id).select('+password')
    console.log('Verified saved user:', {
      id: verifiedUser?._id,
      email: verifiedUser?.email,
      hasPassword: !!verifiedUser?.password,
      password: verifiedUser?.password
    })

    // Create initial user progress
    const userProgress = new UserProgress({
      user_id: savedUser._id.toString(),
      xp: 0,
      level: 1,
      streak: 0,
      completed_scenarios: [],
      rationality_score: 0,
      decisiveness_score: 0,
      last_active: new Date()
    })

    await userProgress.save()

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: {
          id: savedUser._id,
          email: savedUser.email,
          name: savedUser.name
        }
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Registration error:', error)
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return NextResponse.json(
        { 
          message: 'An account with this email already exists',
          suggestion: 'Please try logging in instead'
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Error creating user account',
        details: error.message || 'An unexpected error occurred'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required for account deletion' },
        { status: 400 }
      )
    }

    await connectDB()

    // Delete the user
    const result = await User.deleteOne({ email })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { 
          message: 'User not found',
          suggestion: 'The account may have already been deleted'
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: 'User account deleted successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Deletion error:', error)
    return NextResponse.json(
      { 
        message: 'Error deleting user account',
        details: error.message || 'An unexpected error occurred'
      },
      { status: 500 }
    )
  }
} 