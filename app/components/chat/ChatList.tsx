'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

interface Chat {
  _id: string;
  participants: {
    _id: string;
    name: string;
    image?: string;
  }[];
  lastMessage?: {
    content: string;
    timestamp: Date;
    sender: {
      _id: string;
      name: string;
    };
  };
}

interface ChatListProps {
  onSelectChat: (chat: Chat) => void;
}

export function ChatList({ onSelectChat }: ChatListProps) {
  const { data: session } = useSession();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch('/api/chat');
        if (!response.ok) {
          throw new Error('Failed to fetch chats');
        }
        const data = await response.json();
        setChats(data);
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchChats();
    }
  }, [session]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full h-[600px]">
      <CardContent className="p-0">
        <ScrollArea className="h-full">
          {chats.map((chat) => {
            const otherParticipant = chat.participants.find(
              (p) => p._id !== session?.user?.id
            );

            if (!otherParticipant) return null;

            return (
              <div
                key={chat._id}
                className="p-4 border-b cursor-pointer hover:bg-muted/50"
                onClick={() => onSelectChat(chat)}
              >
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={otherParticipant.image} />
                    <AvatarFallback>{otherParticipant.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{otherParticipant.name}</p>
                    {chat.lastMessage && (
                      <p className="text-sm text-muted-foreground truncate">
                        {chat.lastMessage.sender._id === session?.user?.id
                          ? 'You: '
                          : `${chat.lastMessage.sender.name}: `}
                        {chat.lastMessage.content}
                      </p>
                    )}
                  </div>
                  {chat.lastMessage && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(chat.lastMessage.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 