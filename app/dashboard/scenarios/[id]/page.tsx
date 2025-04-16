'use client'

import { useState, useEffect, use } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { ScenarioContent } from "../components/scenario-content"
import { ScenarioOptions } from "../components/scenario-options"
import { ScenarioFeedback } from "../components/scenario-feedback"
import { ScenarioQuestionnaire } from "../components/scenario-questionnaire"
import { ScenarioAnalysis } from "../components/scenario-analysis"
import { toast } from "sonner"
import ShareScenarioButton from '@/components/ShareScenarioButton'

interface Option {
  text: string
  is_correct: boolean
  feedback?: string
  explanation?: string
}

interface Question {
  id: number
  text: string
  answer: string
}

interface Scenario {
  _id: string
  title: string
  description: string
  content: string
  category: string
  xp_reward: number
  difficulty: number
  options: Option[]
}

export default function ScenarioPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  
  // New states for questionnaire and analysis
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [analysisReport, setAnalysisReport] = useState("")

  useEffect(() => {
    const fetchScenario = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/scenarios/${resolvedParams.id}`)
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to fetch scenario')
        }
        const data = await response.json()
        
        if (!data) {
          throw new Error('Scenario not found')
        }

        setScenario(data)
      } catch (err) {
        console.error('Error fetching scenario:', err)
        setError(err instanceof Error ? err.message : "Failed to fetch scenario")
        toast.error("Failed to load scenario. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (resolvedParams.id) {
      fetchScenario()
    }
  }, [resolvedParams.id])

  const handleOptionSelect = (optionText: string) => {
    setSelectedOption(optionText)
  }

  const handleSubmit = async () => {
    if (!selectedOption || !scenario) return

    try {
      setIsSubmitting(true)
      setError(null)

      const response = await fetch('/api/scenarios/response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenarioId: scenario._id,
          optionText: selectedOption,
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit response')
      }

      toast.success("Response recorded successfully!")
      setIsSubmitted(true)
    } catch (err) {
      console.error('Error submitting response:', err)
      setError(err instanceof Error ? err.message : "Failed to submit response")
      toast.error("Failed to submit response. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStartScenario = () => {
    setShowQuestionnaire(true)
  }

  const handleQuestionnaireComplete = (answers: Question[], analysis: string) => {
    setQuestions(answers)
    setAnalysisReport(analysis)
    setShowQuestionnaire(false)
    setShowAnalysis(true)
  }

  const handleQuestionnaireCancel = () => {
    setShowQuestionnaire(false)
  }

  const handleAnalysisClose = () => {
    setShowAnalysis(false)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" asChild>
            <Link href="/dashboard/scenarios">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Scenarios
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!scenario) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" asChild>
            <Link href="/dashboard/scenarios">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Scenarios
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Scenario not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const selectedOptionData = scenario.options.find(opt => opt.text === selectedOption)

  // Show questionnaire when user clicks "Start Scenario"
  if (showQuestionnaire && scenario) {
    return (
      <div className="container max-w-4xl py-6">
        <ScenarioQuestionnaire
          scenarioId={scenario._id}
          title={scenario.title}
          description={scenario.description}
          content={scenario.content}
          onComplete={handleQuestionnaireComplete}
          onCancel={handleQuestionnaireCancel}
        />
      </div>
    )
  }

  // Show analysis when questionnaire is completed
  if (showAnalysis && scenario) {
    return (
      <div className="container max-w-4xl py-6">
        <ScenarioAnalysis
          scenarioId={scenario._id}
          title={scenario.title}
          description={scenario.description}
          questions={questions}
          analysis={analysisReport}
          onClose={handleAnalysisClose}
        />
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-6">
      <div className="mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>{scenario.title}</CardTitle>
                  <CardDescription>{scenario.category}</CardDescription>
                </div>
              </div>
              <ShareScenarioButton
                scenarioId={scenario._id}
                scenarioType="scenario"
                scenarioData={{
                  title: scenario.title,
                  description: scenario.description,
                  category: scenario.category,
                  difficulty: scenario.difficulty,
                  xp_reward: scenario.xp_reward
                }}
              />
            </div>
          </CardHeader>
          <CardContent>
            <ScenarioContent
              title={scenario.title}
              description={scenario.description}
              content={scenario.content}
              xpReward={scenario.xp_reward}
              difficulty={scenario.difficulty}
            />
            <div className="mt-6 flex justify-center">
              <Button onClick={handleStartScenario} className="w-full sm:w-auto">
                Start Scenario
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Your Decision</CardTitle>
            <CardDescription>Choose the option that best aligns with your values</CardDescription>
          </CardHeader>
          <CardContent>
            {!isSubmitted ? (
              <ScenarioOptions
                options={scenario.options}
                selectedOption={selectedOption}
                onOptionSelect={handleOptionSelect}
                onSubmit={handleSubmit}
                isSubmitted={isSubmitted}
              />
            ) : selectedOptionData ? (
              <ScenarioFeedback
                isCorrect={selectedOptionData.is_correct}
                feedback={selectedOptionData.feedback || "Thank you for your response!"}
                explanation={selectedOptionData.explanation || "Your decision has been recorded."}
              />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
