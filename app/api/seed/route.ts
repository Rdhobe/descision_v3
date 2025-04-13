import { NextResponse } from 'next/server'
import { Scenario } from '@/app/models/Scenario'
import connectDB from '@/lib/mongodb'

const sampleScenarios = [
  {
    title: "Career Crossroads",
    description: "You've been offered a promotion at your current job, but it requires relocating to a different city. Your family is settled in your current location.",
    category: "Career",
    content: "You've been working at your current company for 5 years and have built a strong reputation. The new position offers a 20% salary increase and better career prospects, but would require uprooting your family from their established community.",
    difficulty: "medium",
    xp_reward: 100,
    options: [
      {
        text: "Accept the promotion and relocate",
        is_correct: true,
        feedback: "While challenging, this decision shows long-term career planning and adaptability.",
        explanation: "This option demonstrates strategic career thinking and willingness to embrace change for growth."
      },
      {
        text: "Decline the promotion and stay",
        is_correct: false,
        feedback: "This might limit your career growth and future opportunities.",
        explanation: "While family stability is important, this choice might lead to missed career advancement."
      },
      {
        text: "Negotiate remote work",
        is_correct: true,
        feedback: "Good attempt at finding a balanced solution.",
        explanation: "This shows initiative and problem-solving skills, though might not always be possible."
      }
    ],
    tags: ["career", "family", "relocation"]
  },
  {
    title: "Investment Decision",
    description: "You have $10,000 to invest and need to choose between different investment options.",
    category: "Finance",
    content: "You've saved $10,000 and want to invest it. You're considering between a high-risk tech startup, a stable index fund, or a real estate investment trust.",
    difficulty: "hard",
    xp_reward: 150,
    options: [
      {
        text: "Invest in the tech startup",
        is_correct: false,
        feedback: "Too risky without proper diversification.",
        explanation: "Putting all funds in a single high-risk investment is not recommended."
      },
      {
        text: "Invest in the index fund",
        is_correct: true,
        feedback: "Good choice for long-term growth with moderate risk.",
        explanation: "Index funds provide diversification and historically good returns."
      },
      {
        text: "Split between multiple options",
        is_correct: true,
        feedback: "Excellent risk management strategy.",
        explanation: "Diversification reduces risk while maintaining growth potential."
      }
    ],
    tags: ["finance", "investment", "risk"]
  },
  {
    title: "Time Management",
    description: "You have multiple deadlines approaching and need to prioritize your tasks.",
    category: "Productivity",
    content: "You have three important projects due this week: a client presentation, a team report, and a personal development course. Each requires significant time investment.",
    difficulty: "easy",
    xp_reward: 50,
    options: [
      {
        text: "Focus on the client presentation first",
        is_correct: true,
        feedback: "Good prioritization of external commitments.",
        explanation: "Client work often has the highest immediate impact and consequences."
      },
      {
        text: "Work on all projects simultaneously",
        is_correct: false,
        feedback: "This might lead to subpar results across all projects.",
        explanation: "Multitasking often reduces overall productivity and quality."
      },
      {
        text: "Delegate some tasks to team members",
        is_correct: true,
        feedback: "Smart use of available resources.",
        explanation: "Effective delegation is a key leadership skill."
      }
    ],
    tags: ["productivity", "time-management", "prioritization"]
  }
]

export async function GET() {
  try {
    await connectDB()
    
    // Check if scenarios already exist
    const existingScenarios = await Scenario.countDocuments()
    if (existingScenarios > 0) {
      return NextResponse.json({ 
        message: 'Scenarios already exist in the database',
        count: existingScenarios
      })
    }

    // Insert sample scenarios
    const insertedScenarios = await Scenario.insertMany(sampleScenarios)
    
    return NextResponse.json({ 
      message: 'Successfully seeded database with sample scenarios',
      count: insertedScenarios.length
    })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json({ 
      error: 'Failed to seed database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 