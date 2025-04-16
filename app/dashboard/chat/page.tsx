"use client"

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamic import for Toaster
const Toaster = dynamic(() => import('sonner').then(mod => mod.Toaster), { ssr: false });

// Dynamic imports to solve potential client/server hydration issues
const ChatList = dynamic(() => import('@/components/chat/ChatList').then(mod => mod.ChatList), { 
  ssr: false,
  loading: () => (
    <div className="h-[600px] border rounded-lg animate-pulse bg-muted/20"></div>
  )
});

const ChatWindow = dynamic(() => import('@/components/chat/ChatWindow').then(mod => mod.ChatWindow), { 
  ssr: false,
  loading: () => (
    <div className="h-[600px] border rounded-lg animate-pulse bg-muted/20"></div>
  )
});

export default function ChatPage() {
  const { data: session, status } = useSession();
  const [selectedChat, setSelectedChat] = useState<any>(null);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto p-4">
      <Toaster position="top-right" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <ChatList onSelectChat={setSelectedChat} />
        </div>
        <div className="md:col-span-2">
          {selectedChat ? (
            <ChatWindow
              chatId={selectedChat._id}
              recipient={selectedChat.participants.find(
                (p: any) => p._id !== session.user?.id
              )}
              initialMessages={selectedChat.messages || []}
            />
          ) : (
            <div className="flex items-center justify-center h-[600px] border rounded-lg bg-muted/10">
              <div className="text-center px-6">
                <h3 className="text-lg font-medium mb-2">Welcome to Messages</h3>
                <p className="text-muted-foreground">
                  Select a chat from the left to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 