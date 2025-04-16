import { NextResponse } from 'next/server'
import { Scenario } from '@/app/models/Scenario'
import connectDB from '@/lib/mongodb'
import { generateWithLlama4Maverick } from '@/lib/openrouter'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'

// Define topics for scenarios
const TOPICS = [
  'Data Breach Response',
  'Privacy Policy Compliance',
  'Social Engineering Defense',
  'Password Management',
  'Access Control',
  'Remote Work Security',
  'Device Security',
  'Cloud Security',
  'Network Security',
  'Incident Response',
  'Security Training',
  'Secure Coding',
  'BYOD Policies',
  'IoT Security',
  'Ransomware Prevention',
  'Physical Security',
  'Mobile Device Security',
  'Third-party Vendor Risk',
  'Data Classification',
  'Phishing Awareness'
]

export async function POST(request: Request) {
  try {
    // Check for API key authorization
    const { searchParams } = new URL(request.url)
    const apiKey = searchParams.get('apiKey')
    
    // Verify API key (replace with your actual API key check)
    if (apiKey !== process.env.DAILY_SCENARIO_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Connect to database
    await connectDB()
    
    // Check if a scenario was already created today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const existingDailyScenario = await Scenario.findOne({
      type: 'daily_challenge',
      created_at: { $gte: today, $lt: tomorrow }
    })
    
    if (existingDailyScenario) {
      return NextResponse.json({ 
        message: 'Daily scenario already exists for today',
        scenarioId: existingDailyScenario._id
      })
    }

    // Select a random topic
    const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)]
    
    // Generate a scenario using OpenRouter
    const prompt = `
Create a cybersecurity decision-making scenario about "${topic}" for professionals to test their decision-making skills.

The scenario should include:
1. A realistic situation related to ${topic} that requires a decision
2. Clear context and stakeholders involved
3. Ethical considerations and potential trade-offs
4. At least 3 realistic options to choose from

Format your response as a JSON object with the following structure:
{
  "title": "A brief, catchy title for the scenario",
  "description": "A one-sentence summary of the scenario (30-50 words)",
  "content": "The full scenario description (200-300 words)",
  "category": "${topic}",
  "difficulty": 3,
  "options": [
    {
      "text": "Option 1 description",
      "is_correct": true/false,
      "feedback": "Feedback on why this option is good/bad",
      "explanation": "More detailed explanation of the consequences"
    },
    {
      "text": "Option 2 description",
      "is_correct": true/false,
      "feedback": "Feedback on why this option is good/bad",
      "explanation": "More detailed explanation of the consequences"
    },
    {
      "text": "Option 3 description",
      "is_correct": true/false,
      "feedback": "Feedback on why this option is good/bad",
      "explanation": "More detailed explanation of the consequences"
    }
  ]
}

Ensure at least one option is marked as "is_correct": true. The difficulty should be a number from 1-5.
`
    
    const completion = await generateWithLlama4Maverick([
      { role: "system", content: "You are a cybersecurity expert who creates realistic decision scenarios for training." },
      { role: "user", content: prompt }
    ])
    
    // Extract and parse the response
    let responseText = completion.choices?.[0]?.message?.content || ''
    
    if (!responseText) {
      throw new Error('Failed to generate scenario')
    }
    
    // Clean the response if it contains markdown code blocks
    if (responseText.includes('```')) {
      const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
      if (jsonMatch && jsonMatch[1]) {
        responseText = jsonMatch[1]
      } else {
        responseText = responseText.replace(/```(?:json)?|```/g, '').trim()
      }
    }
    
    // Parse the JSON response
    const scenarioData = JSON.parse(responseText)
    
    // Validate the scenario data
    if (!scenarioData.title || !scenarioData.content || !Array.isArray(scenarioData.options) || scenarioData.options.length < 2) {
      throw new Error('Generated scenario is missing required fields')
    }
    
    // Create the scenario in the database
    const newScenario = new Scenario({
      ...scenarioData,
      type: 'daily_challenge',
      created_by: 'system',
      created_at: new Date(),
      active_date: new Date(),
      xp_reward: scenarioData.xp_reward || 25, // Higher reward for daily challenges
    })
    
    await newScenario.save()
    
    return NextResponse.json({
      message: 'Daily scenario created successfully',
      scenarioId: newScenario._id,
      title: newScenario.title
    })
    
  } catch (error) {
    console.error('Error generating daily scenario:', error)
    return NextResponse.json(
      { error: 'Failed to generate daily scenario' },
      { status: 500 }
    )
  }
}

// Also allow GET requests to trigger the generation (for easier testing)
export async function GET(request: Request) {
  // Use the same handler as POST
  return POST(request)
} 