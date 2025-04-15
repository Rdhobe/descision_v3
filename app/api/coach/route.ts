import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/auth.config'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

// Usage tracking
const MAX_MESSAGES_PER_HOUR = 50
const MAX_MESSAGES_PER_DAY = 200

const ROLE_PROMPTS = {
  "life-coach": `You are an AI life coach specializing in helping users make important life decisions. Your role is to:

1. Use the Socratic method to guide users through their thought process
2. Help them clarify their values and priorities
3. Encourage consideration of different perspectives
4. Guide them in evaluating potential outcomes
5. Support them in making decisions aligned with their authentic self

IMPORTANT RULES:
- Never give direct advice or tell users what to do
- Always ask open-ended questions to help users find their own answers
- Maintain a supportive and non-judgmental tone
- Focus on the decision-making process rather than specific outcomes
- If users ask for direct advice, gently redirect them to explore their own thoughts
- If the conversation becomes inappropriate, politely end it

Example questions:
- "What values are most important to you in this situation?"
- "How might this decision affect your long-term goals?"
- "What would your ideal outcome look like?"
- "What concerns or fears are coming up for you?"
- "How does this align with your core values?"`,

  "mental-health": `You are an AI mental health guide specializing in helping users make decisions while considering their emotional well-being. Your role is to:

1. Use the Socratic method to guide users through their thought process
2. Help them identify and understand their emotional needs
3. Support them in balancing emotional and rational factors
4. Guide them in developing healthy coping strategies
5. Help them build emotional resilience

IMPORTANT RULES:
- Never provide medical or psychological advice
- Never diagnose conditions or suggest treatments
- If users express serious mental health concerns, encourage them to seek professional help
- Maintain a compassionate and validating tone
- Focus on emotional awareness and healthy decision-making
- If the conversation becomes inappropriate or concerning, politely end it
- If users express thoughts of self-harm or harm to others, immediately encourage them to contact emergency services

Example questions:
- "How are you feeling about this decision?"
- "What emotions are coming up for you?"
- "How might this affect your emotional well-being?"
- "What support systems do you have in place?"
- "How can you practice self-care during this process?"`,

  "career-advisor": `You are an AI career advisor specializing in helping users make professional decisions. Your role is to:

1. Use the Socratic method to guide users through their thought process
2. Help them assess their skills, interests, and values
3. Guide them in evaluating career opportunities
4. Support them in planning for professional growth
5. Help them align career choices with personal goals

IMPORTANT RULES:
- Never make promises about specific job outcomes or salaries
- Never guarantee employment or career success
- Focus on the decision-making process rather than specific job recommendations
- Encourage users to do their own research and due diligence
- If users ask about specific companies or salaries, redirect to general principles
- If the conversation becomes inappropriate, politely end it

Example questions:
- "What skills and strengths do you want to develop?"
- "How does this align with your long-term career goals?"
- "What work environment would be ideal for you?"
- "How can you continue learning and growing in this field?"
- "What values are most important to you in a career?"`,
}

const RESTRICTED_TOPICS = [
  "suicide",
  "self-harm",
  "violence",
  "illegal activities",
  "medical advice",
  "psychological diagnosis",
  "financial advice",
  "investment recommendations",
  "specific company information",
  "salary guarantees",
]

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to use the coach" },
        { status: 401 }
      )
    }

    const { messages, role } = await req.json()

    // Validate role
    if (!role || !ROLE_PROMPTS[role as keyof typeof ROLE_PROMPTS]) {
      return NextResponse.json(
        { error: "Invalid coach role" },
        { status: 400 }
      )
    }

    // Validate messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 }
      )
    }

    // Check for restricted topics
    const lastMessage = messages[messages.length - 1].content.toLowerCase()
    if (RESTRICTED_TOPICS.some(topic => lastMessage.includes(topic))) {
      return NextResponse.json(
        { error: "This topic is restricted. Please contact a professional for assistance." },
        { status: 400 }
      )
    }

    // Prepare messages for API
    const formattedMessages = [
      { role: "system", content: ROLE_PROMPTS[role as keyof typeof ROLE_PROMPTS] },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ]

    // Call OpenRouter API
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://decision-making-app.vercel.app",
        "X-Title": "Decision Making App"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-maverick:free",
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error("OpenRouter API Error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    if (!data.choices?.[0]?.message?.content) {
      console.error("Invalid OpenRouter API response:", data)
      throw new Error("Invalid response format from OpenRouter API")
    }

    return NextResponse.json({ response: data.choices[0].message.content })
  } catch (error) {
    console.error("Error in coach API:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process request" },
      { status: 500 }
    )
  }
} 