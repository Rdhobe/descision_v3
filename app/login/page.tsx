"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { signIn, useSession } from "next-auth/react"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAlert, setShowAlert] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated") {
      router.push('/dashboard')
    }
  }, [status, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setShowAlert(false)
    setIsLoading(true)

    try {
      // Basic validation
      if (!email || !password) {
        setError('Please enter both email and password')
        setShowAlert(true)
        setIsLoading(false)
        return
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
        setShowAlert(true)
        setIsLoading(false)
        return
      }

      // Show success message
      toast({
        title: "Success",
        description: "You have been successfully logged in.",
      })

      // Redirect to dashboard
      router.push('/dashboard')
      router.refresh()

    } catch (error: any) {
      console.error('Login error:', error)
      setError('An unexpected error occurred. Please try again later.')
      setShowAlert(true)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (status === "authenticated") {
    return null
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Enter your credentials to sign in to your account</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Log In</CardTitle>
            <CardDescription>Continue your journey to better decision-making</CardDescription>
          </CardHeader>
          <CardContent>
            {showAlert && (
              <Alert variant={error ? "destructive" : "default"} className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{error ? "Error" : "Success"}</AlertTitle>
                <AlertDescription>
                  {error || "Sign in successful! Redirecting..."}
                </AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleLogin}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">
              <Link href="#" className="underline underline-offset-4 hover:text-primary">
                Forgot your password?
              </Link>
            </div>
          </CardFooter>
        </Card>
        <p className="px-8 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
