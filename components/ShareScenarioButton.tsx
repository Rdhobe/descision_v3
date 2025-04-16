import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

type ShareScenarioButtonProps = {
  scenarioId: string;
  scenarioType: 'scenario' | 'challenge';
  scenarioData: {
    title: string;
    description: string;
    category: string;
    difficulty: number;
    xp_reward: number;
  };
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
};

const ShareScenarioButton = ({ 
  scenarioId, 
  scenarioType, 
  scenarioData,
  variant = 'secondary',
  size = 'default'
}: ShareScenarioButtonProps) => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open && users.length === 0) {
      setIsFetching(true);
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error('Failed to fetch users', error);
      } finally {
        setIsFetching(false);
      }
    }
  };

  const handleShareWithUser = async (userId: string) => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: userId,
          message: '',
          messageType: scenarioType,
          scenarioId,
          scenarioData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to share scenario');
      }

      toast.success(`Shared ${scenarioType} successfully!`);
      setIsOpen(false);
    } catch (error) {
      console.error('Error sharing scenario:', error);
      toast.error('Failed to share scenario');
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user._id !== session?.user?.id && // Don't show current user
    (
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          <Share className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share with Friends</DialogTitle>
        </DialogHeader>
        <div className="relative mt-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="mt-4 max-h-[300px] overflow-y-auto space-y-2">
          {isFetching ? (
            <div className="text-center py-4">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              {users.length === 0 ? "No users found" : "No users match your search"}
            </div>
          ) : (
            filteredUsers.map(user => (
              <div
                key={user._id}
                className="flex items-center justify-between gap-3 p-3 hover:bg-muted rounded-md"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.image} />
                    <AvatarFallback>{user.name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleShareWithUser(user._id)}
                  disabled={loading}
                >
                  Share
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareScenarioButton; 