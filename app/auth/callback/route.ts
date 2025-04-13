import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth.config'
import { getServerSession } from 'next-auth'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.redirect(new URL('/signin', req.url))
    }

    // Redirect to dashboard after successful authentication
    return NextResponse.redirect(new URL('/dashboard', req.url))
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(new URL('/signin', req.url))
  }
}
