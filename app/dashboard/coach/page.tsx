"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Brain, Send, Lightbulb, User, MessageSquare, Sparkles, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

type CoachRole = "life-coach" | "mental-health" | "career-advisor"

export default function CoachPage() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<CoachRole>("life-coach")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    // Initialize with a welcome message when the role changes
    if (messages.length === 0) {
      setMessages([
        {
          id: Date.now().toString(),
          role: "assistant",
          content: getRoleWelcomeMessage(selectedRole),
          timestamp: new Date(),
        },
      ])
    }
  }, [selectedRole])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          role: selectedRole,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }

      const data = await response.json()

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiResponse])
    } catch (error) {
      console.error("Error getting AI response:", error)
      toast.error("Failed to get AI response. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleRoleChange = (role: CoachRole) => {
    setSelectedRole(role)
    setMessages([])
  }

  const getRoleWelcomeMessage = (role: CoachRole): string => {
    switch (role) {
      case "life-coach":
        return "Hello! I'm your life coach. I'm here to help you navigate life's challenges and make decisions that align with your values and goals. What's on your mind today?"
      case "mental-health":
        return "Hi there! I'm here to support your mental well-being. I can help you process emotions, develop coping strategies, and work through challenges. How are you feeling today?"
      case "career-advisor":
        return "Welcome! I'm your career advisor. I can help you explore career options, develop professional skills, and make strategic career decisions. What career-related questions do you have?"
      default:
        return "Hello! How can I help you today?"
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="container max-w-4xl py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">AI Decision Coach</h1>
        <p className="text-muted-foreground">
          Your personal coach using the Socratic method to help you make better decisions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="h-[calc(100vh-220px)] flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=40&width=40" />
                  <AvatarFallback>
                    <Lightbulb className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">Decision Coach</CardTitle>
                  <CardDescription>Using Socratic questioning</CardDescription>
                </div>
                <Badge variant="outline" className="ml-auto flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  <span>AI</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <p className="text-sm">Thinking...</p>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
            <CardFooter className="border-t p-3">
              <div className="flex w-full items-center space-x-2">
                <Textarea
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-10 flex-1"
                  disabled={isLoading}
                />
                <Button size="icon" onClick={handleSendMessage} disabled={!input.trim() || isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Coach Roles</CardTitle>
              <CardDescription>Your AI coach can take different perspectives</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  variant={selectedRole === "life-coach" ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleRoleChange("life-coach")}
                >
                  <Brain className="mr-2 h-4 w-4" />
                  Life Coach
                </Button>
                <Button
                  variant={selectedRole === "mental-health" ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleRoleChange("mental-health")}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Mental Health Guide
                </Button>
                <Button
                  variant={selectedRole === "career-advisor" ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleRoleChange("career-advisor")}
                >
                  <User className="mr-2 h-4 w-4" />
                  Career Advisor
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Suggested Topics</CardTitle>
              <CardDescription>Common decision areas to explore</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div
                  className="rounded-lg border p-3 cursor-pointer hover:bg-muted/50"
                  onClick={() => setInput("I'm trying to decide whether to change careers. What should I consider?")}
                >
                  Career decisions
                </div>
                <div
                  className="rounded-lg border p-3 cursor-pointer hover:bg-muted/50"
                  onClick={() => setInput("I'm having trouble making a decision about my relationship. Can you help?")}
                >
                  Relationship dilemmas
                </div>
                <div
                  className="rounded-lg border p-3 cursor-pointer hover:bg-muted/50"
                  onClick={() => setInput("I need help making a financial decision. What factors should I consider?")}
                >
                  Financial choices
                </div>
                <div
                  className="rounded-lg border p-3 cursor-pointer hover:bg-muted/50"
                  onClick={() => setInput("I'm going through a major life transition. How can I make the best decision?")}
                >
                  Life transitions
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
