'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Brain, Share2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Question {
  id: number
  text: string
  answer: string
}

interface ScenarioAnalysisProps {
  scenarioId: string
  title: string
  questions: Question[]
  analysis: string
  onClose: () => void
}

export function ScenarioAnalysis({
  scenarioId,
  title,
  questions,
  analysis,
  onClose
}: ScenarioAnalysisProps) {
  const [activeTab, setActiveTab] = useState('analysis')
  
  const handleDownload = () => {
    try {
      // Format the analysis content
      const content = `# Analysis Report for "${title}"\n\n## Questions & Answers\n\n${questions.map(
        (q) => `Q: ${q.text}\nA: ${q.answer}\n\n`
      ).join('')}\n\n## Analysis\n\n${analysis}`
      
      // Create blob and download
      const blob = new Blob([content], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `scenario-analysis-${scenarioId}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('Analysis report downloaded successfully')
    } catch (error) {
      console.error('Error downloading analysis:', error)
      toast.error('Failed to download analysis report')
    }
  }
  
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(analysis)
      toast.success('Analysis copied to clipboard')
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      toast.error('Failed to copy analysis to clipboard')
    }
  }
  
  // Function to format analysis with sections and highlights
  const formatAnalysis = () => {
    // Split analysis by markdown headers or double line breaks
    const sections = analysis.split(/#{2,3}|\n\n/).filter(Boolean)
    
    return sections.map((section, index) => {
      const trimmedSection = section.trim()
      
      // Check if this is a header section
      const isHeader = trimmedSection.startsWith('#') || 
                       (index > 0 && sections[index-1].endsWith(':'))
      
      if (isHeader) {
        return (
          <h3 key={index} className="text-lg font-semibold mt-6 mb-3">
            {trimmedSection.replace(/^#\s*/, '')}
          </h3>
        )
      }
      
      // Highlight important insights with badges
      const highlightedText = trimmedSection.split(/\*\*([^*]+)\*\*/).map((part, i) => {
        if (i % 2 === 1) { // This is content between ** markers
          return (
            <Badge key={i} variant="outline" className="mx-1 bg-primary/10">
              {part}
            </Badge>
          )
        }
        return <span key={i}>{part}</span>
      })
      
      return <p key={index} className="mb-4">{highlightedText}</p>
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Decision Analysis</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleShare} title="Copy to clipboard">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleDownload} title="Download report">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          Based on your answers to "{title}"
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="responses">Your Responses</TabsTrigger>
          </TabsList>
          <TabsContent value="analysis" className="min-h-[300px]">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {formatAnalysis()}
            </div>
          </TabsContent>
          <TabsContent value="responses">
            <div className="space-y-4">
              {questions.map((question) => (
                <div key={question.id} className="border rounded-lg p-4">
                  <p className="font-medium mb-2">{question.text}</p>
                  <p className="text-sm bg-muted p-3 rounded">{question.answer}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={onClose} className="w-full">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Scenario
        </Button>
      </CardFooter>
    </Card>
  )
} 