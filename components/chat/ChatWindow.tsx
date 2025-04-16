// components/chat/ChatWindow.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Send, Info, MoreHorizontal, PaperclipIcon, Image as ImageIcon, CheckCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useSocket } from '@/hooks/useSocket';
import { FileUpload } from './FileUpload';
import { EmojiPicker } from './EmojiPicker';
import Image from 'next/image';
import { debounce } from 'lodash';
import ShareScenarioDialog from './ShareScenarioDialog';
import ScenarioCard from './ScenarioCard';

interface Message {
  _id?: string;
  sender: string;
  content: string;
  timestamp: Date;
  readBy: string[];
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
  messageType?: 'text' | 'file' | 'scenario' | 'challenge';
  scenarioId?: string;
  scenarioData?: {
    title: string;
    description: string;
    category: string;
    difficulty: number;
    xp_reward: number;
  };
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
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [typingStatus, setTypingStatus] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { 
    joinChat, 
    sendMessage, 
    onReceiveMessage, 
    onUserTyping, 
    startTyping, 
    stopTyping,
    isConnected
  } = useSocket();

  // Join chat room on mount and reconnect if needed
  useEffect(() => {
    if (chatId && isConnected) {
      joinChat(chatId);
    }
  }, [chatId, joinChat, isConnected]);

  // Listen for new messages
  useEffect(() => {
    const unsubscribe = onReceiveMessage ? onReceiveMessage((newMsg) => {
      if (newMsg) {
        setMessages(prev => [...prev, newMsg]);
      }
    }) : () => {};

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [onReceiveMessage]);

  // Listen for typing status
  useEffect(() => {
    const unsubscribe = onUserTyping ? onUserTyping(({ userId, isTyping }) => {
      if (userId === recipient._id) {
        setTypingStatus(isTyping);
      }
    }) : () => {};

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [onUserTyping, recipient._id]);

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

  // Handle typing events with debounce
  const debouncedTypingStop = useRef(
    debounce(() => {
      if (session?.user?.id) {
        stopTyping(chatId, session.user.id);
      }
    }, 1000)
  ).current;

  const handleTyping = () => {
    if (session?.user?.id) {
      startTyping(chatId, session.user.id);
      debouncedTypingStop();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const uploadFiles = async (files: File[]): Promise<Array<{ url: string, fileName: string, fileType: string }>> => {
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed for ${file.name}`);
        }

        const data = await response.json();
        return {
          url: data.url,
          fileName: file.name,
          fileType: file.type
        };
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload one or more files');
      return [];
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!newMessage.trim() && selectedFiles.length === 0) return;
    
    try {
      setLoading(true);
      let fileData: { url: string, fileName: string, fileType: string }[] = [];

      if (selectedFiles.length > 0) {
        setIsUploadingFile(true);
        fileData = await uploadFiles(selectedFiles);
        setIsUploadingFile(false);
      }

      // Create the message content
      const messageToSend = {
        recipientId: recipient._id,
        message: newMessage,
        ...(fileData.length > 0 && { 
          fileUrl: fileData[0].url,
          fileName: fileData[0].fileName,
          fileType: fileData[0].fileType,
          messageType: 'file'
        }),
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageToSend),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // Update the messages with the new one
      setMessages(data.messages);
      
      // Send message through socket
      const newMsg = data.messages[data.messages.length - 1];
      sendMessage(chatId, newMsg);
      
      // Reset state
      setNewMessage('');
      setSelectedFiles([]);
      setShowFileUpload(false);
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleShareScenario = async (scenarioId: string, scenarioData: any, messageType: 'scenario' | 'challenge') => {
    try {
      setLoading(true);
      
      const messageToSend = {
        recipientId: recipient._id,
        message: '',
        messageType,
        scenarioId,
        scenarioData
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageToSend),
      });

      if (!response.ok) {
        throw new Error('Failed to send scenario');
      }

      const data = await response.json();
      
      // Update the messages with the new one
      setMessages(data.messages);
      
      // Send message through socket
      const newMsg = data.messages[data.messages.length - 1];
      sendMessage(chatId, newMsg);
      
    } catch (error) {
      console.error('Error sharing scenario:', error);
      toast.error('Failed to share scenario');
    } finally {
      setLoading(false);
    }
  };

  const renderDate = (date: Date) => {
    return format(new Date(date), 'h:mm a');
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    inputRef.current?.focus();
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

  const renderMessageContent = (message: Message) => {
    // If the message is a scenario or challenge
    if (message.messageType === 'scenario' || message.messageType === 'challenge') {
      return (
        <div className="mb-2">
          {message.scenarioData && (
            <ScenarioCard 
              title={message.scenarioData.title}
              description={message.scenarioData.description}
              category={message.scenarioData.category}
              difficulty={message.scenarioData.difficulty}
              xpReward={message.scenarioData.xp_reward}
              scenarioId={message.scenarioId || ''}
              messageType={message.messageType}
            />
          )}
          {message.content && message.content.indexOf('Shared a') !== 0 && (
            <p className="mt-2 break-words">{message.content}</p>
          )}
        </div>
      );
    }
    
    // If the message has a file
    if (message.fileUrl) {
      if (message.fileType?.startsWith('image/')) {
        return (
          <div className="mb-2">
            <Image 
              src={message.fileUrl} 
              alt={message.fileName || 'Image'} 
              width={300} 
              height={200}
              className="rounded-md max-w-full object-contain"
              style={{ maxHeight: '200px' }}
            />
            {message.content && <p className="mt-2 break-words">{message.content}</p>}
          </div>
        );
      } else {
        return (
          <div className="mb-2">
            <a 
              href={message.fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 border rounded-md hover:bg-muted"
            >
              <ImageIcon className="h-5 w-5" />
              <span className="text-sm truncate">{message.fileName || 'File'}</span>
            </a>
            {message.content && <p className="mt-2 break-words">{message.content}</p>}
          </div>
        );
      }
    }
    
    // Regular text message
    return <p className="break-words">{message.content}</p>;
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
              {typingStatus ? (
                <span className="text-blue-500">Typing...</span>
              ) : (
                recipient.email || 'Online'
              )}
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
              const isRead = message.readBy.includes(recipient._id);
              
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
                    {renderMessageContent(message)}
                    <div className={`flex items-center justify-between mt-1 ${isCurrentUser ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      <span className="text-xs">{renderDate(message.timestamp)}</span>
                      {isCurrentUser && (
                        <span className="ml-2">
                          <CheckCheck className={`h-3 w-3 ${isRead ? 'text-blue-500' : ''}`} />
                        </span>
                      )}
                    </div>
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

      {/* File upload area */}
      {showFileUpload && (
        <div className="p-4 border-t bg-background">
          <FileUpload 
            onFileSelect={setSelectedFiles}
            onClearFiles={() => setSelectedFiles([])}
            selectedFiles={selectedFiles}
          />
        </div>
      )}

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setShowFileUpload(!showFileUpload)}
          >
            <PaperclipIcon className="h-5 w-5" />
          </Button>
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder={typingStatus ? "Someone is typing..." : "Message..."}
            className="flex-1"
            disabled={loading || isUploadingFile}
          />
          <ShareScenarioDialog onShare={handleShareScenario} />
          <EmojiPicker onEmojiSelect={handleEmojiSelect} />
          <Button
            type="submit"
            size="icon"
            disabled={loading || isUploadingFile || (!newMessage.trim() && selectedFiles.length === 0)}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;