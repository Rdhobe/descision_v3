import { NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import { User } from "@/app/models/User"
import mongoose from 'mongoose'

// Handle GET requests
export async function GET() {
  return NextResponse.json(
    { 
      message: 'This endpoint only accepts POST requests for authentication',
      suggestion: 'Use POST method with email and password in the request body'
    },
    { status: 405 }
  )
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    console.log('Login attempt:', { email })

    // Input validation
    if (!email || !password) {
      console.log('Missing credentials:', { email: !!email, password: !!password })
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Connect to MongoDB
    await connectDB()
    console.log('MongoDB connection state:', mongoose.connection.readyState)

    // Find user by email and explicitly select password field
    const user = await User.findOne({ email }).select('+password')
    console.log('User found:', {
      id: user?._id,
      email: user?.email,
      hasPassword: !!user?.password,
      password: user?.password ? '***' : null
    })

    if (!user) {
      console.log('No user found with email:', email)
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if user has a password
    if (!user.password) {
      console.error('User has no password:', user._id)
      return NextResponse.json(
        { message: 'Account not properly set up. Please contact support.' },
        { status: 500 }
      )
    }

    // Verify password directly using bcrypt
    const isValid = await compare(password, user.password)
    console.log('Password verification:', {
      isValid,
      providedPassword: password,
      storedHash: user.password
    })

    if (!isValid) {
      console.log('Invalid password for user:', email)
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create a response with user data
    const response = NextResponse.json(
      {
        message: 'Sign in successful',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 200 }
    )

    // Set authentication cookies
    response.cookies.set('auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })

    // Set user session cookie
    response.cookies.set('user', JSON.stringify({
      id: user._id,
      email: user.email,
      name: user.name,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })

    return response
  } catch (error: any) {
    console.error('Sign in error:', error)
    return NextResponse.json(
      { 
        message: 'Error signing in',
        details: error.message || 'An unexpected error occurred'
      },
      { status: 500 }
    )
  }
} 