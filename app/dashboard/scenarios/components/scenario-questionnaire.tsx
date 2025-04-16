'use client'

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowLeft, CheckCircle, Loader2, Brain } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from 'sonner';

interface Question {
  id: number;
  text: string;
  answer: string;
}

interface ScenarioQuestionnaireProps {
  scenarioId: string;
  title: string;
  description: string;
  content: string;
  onComplete: (questions: Question[], analysis: string) => void;
  onCancel: () => void;
}

export function ScenarioQuestionnaire({
  scenarioId,
  title,
  description,
  content,
  onComplete,
  onCancel
}: ScenarioQuestionnaireProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(true);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    generateQuestions();
  }, []);

  const generateQuestions = async () => {
    try {
      setIsGeneratingQuestions(true);
      
      // Call API to generate questions based on scenario content
      const response = await fetch('/api/scenarios/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenarioId,
          scenarioTitle: title,
          scenarioDescription: description,
          scenarioContent: content
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const data = await response.json();
      
      // Check if data has questions property and it's an array
      if (!data || !data.questions || !Array.isArray(data.questions)) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from API');
      }
      
      // Create a set of questions from the response
      const generatedQuestions: Question[] = data.questions.map((q: string | any, index: number) => ({
        id: index + 1,
        text: typeof q === 'string' ? q : (q.text || `Question ${index + 1}`),
        answer: ''
      }));

      setQuestions(generatedQuestions);
    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error('Failed to generate questions. Please try again.');
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentAnswer(e.target.value);
  };

  const handleNext = () => {
    if (!currentAnswer.trim()) {
      toast.error('Please provide an answer before continuing');
      return;
    }

    // Save answer to current question
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex].answer = currentAnswer;

    setQuestions(updatedQuestions);
    
    // Move to next question or submit if at the end
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setCurrentAnswer('');
      setProgress(((currentQuestionIndex + 1) / questions.length) * 100);
    } else {
      handleSubmitAnswers(updatedQuestions);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
      setCurrentAnswer(questions[currentQuestionIndex - 1].answer);
      setProgress(((currentQuestionIndex - 1) / questions.length) * 100);
    }
  };

  const handleSubmitAnswers = async (finalQuestions: Question[]) => {
    try {
      setIsGeneratingAnalysis(true);
      
      // Call API to generate analysis based on answers
      const response = await fetch('/api/scenarios/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenarioId,
          scenarioTitle: title,
          userAnswers: finalQuestions.map(q => ({
            question: q.text,
            answer: q.answer
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate analysis');
      }

      const data = await response.json();
      
      // Complete questionnaire with analysis
      onComplete(finalQuestions, data.analysis);
    } catch (error) {
      console.error('Error generating analysis:', error);
      toast.error('Failed to generate analysis. Please try again.');
      setIsGeneratingAnalysis(false);
    }
  };

  if (isGeneratingQuestions) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>Preparing your questions</CardTitle>
          <CardDescription>
            We're analyzing the scenario to create personalized questions
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (isGeneratingAnalysis) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>Analyzing your answers</CardTitle>
          <CardDescription>
            We're generating a personalized analysis based on your responses
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>No Questions Available</CardTitle>
          <CardDescription>
            We couldn't generate questions for this scenario
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center gap-4">
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Scenario
          </Button>
          <Button onClick={generateQuestions}>
            Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>{title}</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>
        <CardDescription className="mt-2">
          Question {currentQuestionIndex + 1} of {questions.length}
        </CardDescription>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent>
        <h3 className="text-lg font-medium mb-4">{currentQuestion.text}</h3>
        <Textarea
          placeholder="Type your answer here..."
          className="min-h-32"
          value={currentAnswer || currentQuestion.answer}
          onChange={handleAnswerChange}
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button onClick={handleNext}>
          {currentQuestionIndex < questions.length - 1 ? (
            <>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            'Submit All Answers'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 