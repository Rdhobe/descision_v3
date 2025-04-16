'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSocket } from '@/hooks/useSocket';

interface ChatListProps {
  onSelectChat: (chat: any) => void;
}

export const ChatList = ({ onSelectChat }: ChatListProps) => {
  const { data: session } = useSession();
  const [chats, setChats] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [openNewChat, setOpenNewChat] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const { onReceiveMessage, isConnected } = useSocket();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/chat');
        if (!response.ok) {
          throw new Error('Failed to fetch chats');
        }
        const data = await response.json();
        setChats(data.chats || []);
        setTotalUnread(data.totalUnread || 0);
      } catch (error) {
        console.error('Error fetching chats:', error);
        setError('Failed to load chats');
      } finally {
        setLoading(false);
      }
    };

    fetchChats();

    // Refresh the chat list when we receive a new message
    // Only set up the socket listener if socket is connected
    const unsubscribe = onReceiveMessage ? onReceiveMessage(() => {
      fetchChats();
    }) : () => {};

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [onReceiveMessage]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSelectChat = (chat: any) => {
    setActiveChat(chat._id);
    onSelectChat(chat);
  };

  const handleStartNewChat = async (userId: string) => {
    try {
      // Create a new chat with just one message to start the conversation
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: userId,
          message: 'Hello! I wanted to start a conversation with you.',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start new chat');
      }

      const newChat = await response.json();
      
      // Add the new chat to the list and select it
      setChats((prev) => [newChat, ...prev]);
      handleSelectChat(newChat);
      setOpenNewChat(false);
    } catch (error) {
      console.error('Error starting new chat:', error);
    }
  };

  const getOtherParticipant = (chat: any) => {
    return chat.participants.find((p: any) => p._id !== session?.user?.id);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading state
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Messages</h2>
          <Button variant="ghost" size="icon" disabled>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-blue-500 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="p-4 border-b bg-background flex items-center justify-between">
        <h2 className="text-xl font-semibold">Messages</h2>
        <Dialog open={openNewChat} onOpenChange={setOpenNewChat}>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => { 
                fetchUsers();
                setOpenNewChat(true);
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start a new conversation</DialogTitle>
            </DialogHeader>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="mt-4 max-h-[300px] overflow-y-auto space-y-2">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  {searchTerm ? 'No users found' : 'Loading users...'}
                </div>
              ) : (
                filteredUsers.map(user => (
                  <div
                    key={user._id}
                    className="flex items-center gap-3 p-3 hover:bg-muted rounded-md cursor-pointer"
                    onClick={() => handleStartNewChat(user._id)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.image} />
                      <AvatarFallback>
                        {user.name[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="divide-y max-h-[600px] overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <p>No conversations yet</p>
            <Button 
              variant="link" 
              onClick={() => {
                fetchUsers();
                setOpenNewChat(true);
              }}
              className="mt-2"
            >
              Start a new conversation
            </Button>
          </div>
        ) : (
          chats.map(chat => {
            const otherUser = getOtherParticipant(chat);
            const lastMsg = chat.lastMessage;
            const isActive = activeChat === chat._id;
            
            return (
              <div
                key={chat._id}
                className={`flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                  isActive ? 'bg-muted' : chat.unreadCount > 0 ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                }`}
                onClick={() => handleSelectChat(chat)}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage src={otherUser?.image} />
                    <AvatarFallback>
                      {otherUser?.name?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  {chat.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-h-[18px] min-w-[18px] flex items-center justify-center p-0.5 border-2 border-background">
                      {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className={`font-medium truncate ${chat.unreadCount > 0 ? 'font-semibold' : ''}`}>{otherUser?.name}</h3>
                    {lastMsg?.timestamp && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {formatDistanceToNow(new Date(lastMsg.timestamp), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-sm ${chat.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'} truncate`}>
                      {lastMsg ? (
                        <>
                          {lastMsg.sender._id === session?.user?.id ? 'You: ' : ''}
                          {lastMsg.content}
                        </>
                      ) : (
                        'Start a conversation'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;