import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Share, Trophy, Brain } from 'lucide-react';
import ScenarioCard from './ScenarioCard';
import { Skeleton } from '@/components/ui/skeleton';

type Scenario = {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: number;
  xp_reward: number;
  type: 'scenario' | 'daily_challenge';
};

type ShareScenarioDialogProps = {
  onShare: (scenarioId: string, scenarioData: any, messageType: 'scenario' | 'challenge') => void;
};

const ShareScenarioDialog = ({ onShare }: ShareScenarioDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'scenarios' | 'challenges'>('scenarios');
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [dailyChallenges, setDailyChallenges] = useState<Scenario[]>([]);

  // Fetch scenarios and challenges
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch user's scenarios
        const scenariosResponse = await fetch('/api/scenarios');
        const scenariosData = await scenariosResponse.json();
        
        // Fetch daily challenges
        const challengesResponse = await fetch('/api/daily-challenges');
        const challengesData = await challengesResponse.json();
        
        // Filter scenarios and challenges
        const userScenarios = scenariosData.filter((s: Scenario) => s.type === 'scenario');
        const challenges = challengesData.filter((c: Scenario) => c.type === 'daily_challenge');
        
        setScenarios(userScenarios);
        setDailyChallenges(challenges);
      } catch (error) {
        console.error('Error fetching scenarios and challenges:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Filter based on search term
  const filteredScenarios = scenarios.filter(
    (scenario) =>
      scenario.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scenario.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scenario.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredChallenges = dailyChallenges.filter(
    (challenge) =>
      challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleShareScenario = (scenario: Scenario) => {
    const messageType = scenario.type === 'daily_challenge' ? 'challenge' : 'scenario';
    onShare(
      scenario._id, 
      {
        title: scenario.title,
        description: scenario.description,
        category: scenario.category,
        difficulty: scenario.difficulty,
        xp_reward: scenario.xp_reward
      },
      messageType
    );
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Share className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Share Challenge or Scenario</DialogTitle>
        </DialogHeader>
        <div className="relative mt-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search scenarios or challenges..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Tabs defaultValue="scenarios" value={activeTab} onValueChange={(value) => setActiveTab(value as 'scenarios' | 'challenges')}>
          <TabsList className="grid w-full grid-cols-2 mt-2">
            <TabsTrigger value="scenarios" className="flex items-center gap-1">
              <Brain className="h-4 w-4" /> Scenarios
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-1">
              <Trophy className="h-4 w-4" /> Challenges
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="scenarios" className="mt-4">
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full rounded-md" />
                ))}
              </div>
            ) : filteredScenarios.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                {scenarios.length === 0
                  ? "You don't have any scenarios yet"
                  : "No scenarios match your search"}
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {filteredScenarios.map((scenario) => (
                  <div
                    key={scenario._id}
                    className="cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => handleShareScenario(scenario)}
                  >
                    <ScenarioCard
                      title={scenario.title}
                      description={scenario.description}
                      category={scenario.category}
                      difficulty={scenario.difficulty}
                      xpReward={scenario.xp_reward}
                      scenarioId={scenario._id}
                      messageType="scenario"
                      isClickable={false}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="challenges" className="mt-4">
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full rounded-md" />
                ))}
              </div>
            ) : filteredChallenges.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                {dailyChallenges.length === 0
                  ? "You don't have any challenges yet"
                  : "No challenges match your search"}
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {filteredChallenges.map((challenge) => (
                  <div
                    key={challenge._id}
                    className="cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => handleShareScenario(challenge)}
                  >
                    <ScenarioCard
                      title={challenge.title}
                      description={challenge.description}
                      category={challenge.category}
                      difficulty={challenge.difficulty}
                      xpReward={challenge.xp_reward}
                      scenarioId={challenge._id}
                      messageType="challenge"
                      isClickable={false}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ShareScenarioDialog; 