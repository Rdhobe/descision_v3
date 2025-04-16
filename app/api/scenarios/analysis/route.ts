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

    const { 
      scenarioId, 
      scenarioTitle, 
      scenarioDescription, 
      scenarioContent,
      userAnswers 
    } = await request.json()

    if (!scenarioId || !scenarioTitle || !userAnswers || !Array.isArray(userAnswers)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Format user answers for the prompt
    const formattedAnswers = userAnswers.map(qa => 
      `Question: ${qa.question}\nAnswer: ${qa.answer}`
    ).join('\n\n')

    // Generate analysis using OpenRouter with Llama 4 Maverick
    const prompt = `
You are a cybersecurity and digital privacy advisor helping analyze a user's decision-making process for a specific scenario.

Scenario: "${scenarioTitle}"
${scenarioDescription || ''}

Detailed context:
${scenarioContent || ''}

User's answers to questions about this scenario:
${formattedAnswers}

Based on the user's answers, provide a comprehensive analysis of their decision-making approach. Your analysis should:

1. Identify key values and priorities revealed in their answers
2. Assess potential impacts of their decisions on:
   - Personal privacy and security
   - Professional responsibilities
   - Ethical considerations
   - Potential technical implications
3. Suggest alternative perspectives they might consider
4. Provide actionable recommendations for improving their approach

Include sections with headers, and mark important insights with ** around them for highlighting.

Format your response as markdown text with sections, like this:

# Decision-Making Analysis
A brief summary of their approach

## Key Values Identified
Detailed analysis of values

## Impact Assessment
Analysis of impacts

## Alternative Perspectives
Discussion of alternatives

## Recommendations
1. First recommendation
2. Second recommendation

IMPORTANT: DO NOT wrap your response in markdown code blocks (do not use \`\`\` or \`\`\`markdown). 
Provide the raw markdown text directly. Make your analysis insightful and actionable without being judgmental.
`

    const completion = await generateWithLlama4Maverick([
      { role: "system", content: "You are a helpful AI that analyzes decision-making in cybersecurity scenarios." },
      { role: "user", content: prompt }
    ], { response_format: { type: "text" } })

    // Safely access the response content
    let analysisText = completion.choices?.[0]?.message?.content || ''
    
    if (!analysisText) {
      throw new Error('Failed to generate analysis')
    }

    // Clean up the response if it includes markdown code blocks
    if (analysisText.startsWith('```') && analysisText.endsWith('```')) {
      // If the entire response is a code block, extract the content
      analysisText = analysisText.replace(/^```(?:markdown)?|```$/g, '').trim()
    }
    
    console.log('Analysis text:', analysisText)

    // Return the analysis as plain text
    return NextResponse.json({ 
      analysis: analysisText 
    })

  } catch (error) {
    console.error('Error generating scenario analysis:', error)
    return NextResponse.json(
      { error: 'Failed to generate analysis' },
      { status: 500 }
    )
  }
} 