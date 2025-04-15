// components/chat/ChatWindow.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Send, Info, MoreHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface Message {
  _id?: string;
  sender: string;
  content: string;
  timestamp: Date;
  readBy: string[];
}

interface ChatWindowProps {
  chatId: string;
  recipient: {
    _id: string;
    name: string;
    email?: string;
    image?: string;
  };
  initialMessages: Message[];
}

export const ChatWindow = ({
  chatId,
  recipient,
  initialMessages = [],
}: ChatWindowProps) => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add this effect to mark messages as read when the chat is opened
  useEffect(() => {
    if (chatId) {
      const markAsRead = async () => {
        try {
          await fetch('/api/chat', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chatId,
            }),
          });
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      };
      
      markAsRead();
    }
  }, [chatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim()) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: recipient._id,
          message: newMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // Update the messages with the new one
      setMessages(data.messages);
      setNewMessage('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const renderDate = (date: Date) => {
    return format(new Date(date), 'h:mm a');
  };

  // Group messages by date
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach((message) => {
      const date = new Date(message.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-[600px] border rounded-lg overflow-hidden">
      {/* Chat header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={recipient.image} />
            <AvatarFallback>{recipient.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{recipient.name}</h3>
            <p className="text-xs text-muted-foreground">
              {recipient.email || 'Online'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon">
            <Info className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => window.navigator.clipboard.writeText(recipient.email || '')}>
                Copy email address
              </DropdownMenuItem>
              <DropdownMenuItem>View profile</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Mute notifications</DropdownMenuItem>
              <DropdownMenuItem className="text-red-500">Clear conversation</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-muted/20">
        {Object.entries(messageGroups).map(([date, msgs]) => (
          <div key={date} className="space-y-3">
            <div className="flex justify-center">
              <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                {new Date(date).toLocaleDateString(undefined, { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            
            {msgs.map((message, index) => {
              const isCurrentUser = message.sender === session?.user?.id;
              
              return (
                <div
                  key={message._id || index}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      isCurrentUser
                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                        : 'bg-background border rounded-tl-none'
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                    <p className={`text-xs mt-1 ${isCurrentUser ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      {renderDate(message.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        
        {/* Empty state */}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <Avatar className="h-16 w-16 mb-4">
              <AvatarImage src={recipient.image} />
              <AvatarFallback>{recipient.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <h3 className="font-medium text-lg">{recipient.name}</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              {recipient.email || 'Start a conversation'}
            </p>
            <p className="text-muted-foreground text-sm">
              Send a message to start chatting
            </p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Message..."
            className="flex-1"
            disabled={loading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!newMessage.trim() || loading}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;