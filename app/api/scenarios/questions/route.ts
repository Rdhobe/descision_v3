import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { generateWithLlama4Maverick } from '@/lib/openrouter'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { scenarioId, scenarioTitle, scenarioDescription, scenarioContent } = await request.json()

    if (!scenarioId || !scenarioTitle || !scenarioContent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate questions using OpenRouter with Llama 4 Maverick
    const prompt = `
You are helping to create insightful questions for a decision-making scenario about cybersecurity and digital privacy.

Here's the scenario titled "${scenarioTitle}":
${scenarioDescription}

Detailed context:
${scenarioContent}

Generate 5 thought-provoking questions that will help the user reflect on this scenario. Each question should:
1. Be open-ended (not yes/no)
2. Focus on different aspects of the decision-making process
3. Help reveal the user's personal values and thought process
4. Be relevant to the scenario context
5. Not assume any particular answer is "correct"

Format your response as a JSON object with a 'questions' array containing string values. Example:
{
  "questions": [
    "What factors influenced your initial reaction to this scenario?",
    "How would you weigh the trade-offs between privacy and security in this context?",
    "What personal values are being challenged in this scenario?",
    "How might your decision impact different stakeholders involved?",
    "What alternative approaches might address the core issues at stake?"
  ]
}

IMPORTANT: Return ONLY the raw JSON without any markdown code blocks (do not use \`\`\` or \`\`\`json).
`

    const completion = await generateWithLlama4Maverick([
      { role: "system", content: "You are a helpful AI that generates thoughtful questions for cybersecurity decision scenarios." },
      { role: "user", content: prompt }
    ])

    // Safely access the response content
    const responseText = completion.choices?.[0]?.message?.content || ''
    
    if (!responseText) {
      throw new Error('Failed to generate questions')
    }

    try {
      // Strip markdown code blocks if present
      let cleanedResponse = responseText
      
      // Remove markdown code blocks if present (```json ... ```)
      if (responseText.includes('```')) {
        // Find JSON content between markdown code block markers
        const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
        if (jsonMatch && jsonMatch[1]) {
          cleanedResponse = jsonMatch[1]
        } else {
          // If we can't extract properly, just strip the backticks and try to find JSON
          cleanedResponse = responseText.replace(/```(?:json)?|```/g, '').trim()
        }
      }
      
      console.log('Cleaned response for parsing:', cleanedResponse)
      
      const parsedResponse = JSON.parse(cleanedResponse)
      
      // Check if the response has the expected structure
      if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
        console.error('Invalid response format, missing questions array:', parsedResponse)
        
        // If the response doesn't have a questions array but has another array property, use that
        const potentialQuestions = 
          Object.values(parsedResponse).find(value => Array.isArray(value) && value.length > 0)
        
        if (potentialQuestions) {
          // Return with the expected structure
          return NextResponse.json({ questions: potentialQuestions })
        }
        
        throw new Error('Invalid response format from AI')
      }
      
      return NextResponse.json(parsedResponse)
    } catch (e) {
      console.error('Error parsing AI response:', e)
      return NextResponse.json(
        { error: 'Invalid response format from AI service' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error generating scenario questions:', error)
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    )
  }
} 