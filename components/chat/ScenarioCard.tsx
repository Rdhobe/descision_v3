import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { Trophy, Brain, Star, ArrowRight } from 'lucide-react';

type ScenarioCardProps = {
  title: string;
  description: string;
  category: string;
  difficulty: number;
  xpReward: number;
  scenarioId: string;
  messageType: 'scenario' | 'challenge';
  isClickable?: boolean;
};

const ScenarioCard = ({
  title,
  description,
  category,
  difficulty,
  xpReward,
  scenarioId,
  messageType,
  isClickable = true
}: ScenarioCardProps) => {
  const router = useRouter();
  const [clicked, setClicked] = useState(false);

  const handleOpen = () => {
    if (!isClickable) return;
    
    setClicked(true);
    
    // Navigate to the appropriate page based on message type
    if (messageType === 'scenario') {
      router.push(`/dashboard/scenarios/${scenarioId}`);
    } else {
      router.push(`/challenge?id=${scenarioId}`);
    }
  };

  const renderDifficultyStars = () => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${i < difficulty ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  return (
    <Card className={`w-full max-w-sm border-2 ${messageType === 'challenge' ? 'border-blue-500/20' : 'border-green-500/20'} hover:shadow-md transition-all duration-200 ${clicked ? 'opacity-75' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className={messageType === 'challenge' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'}>
            {messageType === 'challenge' ? 'Challenge' : 'Scenario'}
          </Badge>
          <Badge variant="outline">{category}</Badge>
        </div>
        <CardTitle className="text-lg mt-2">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="line-clamp-3 text-sm">
          {description}
        </CardDescription>
        <div className="flex items-center mt-3 gap-2">
          <div className="flex">
            {renderDifficultyStars()}
          </div>
          <span className="text-xs text-muted-foreground ml-1">Difficulty</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-2 border-t">
        <div className="flex items-center">
          {messageType === 'challenge' ? (
            <Trophy className="h-4 w-4 text-blue-500 mr-1" />
          ) : (
            <Brain className="h-4 w-4 text-green-500 mr-1" />
          )}
          <span className="text-sm font-medium">{xpReward} XP</span>
        </div>
        {isClickable && (
          <Button 
            size="sm" 
            variant="ghost" 
            className={messageType === 'challenge' ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950' : 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950'}
            onClick={handleOpen}
          >
            Open <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ScenarioCard; 