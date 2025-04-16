"use client"

// app/chat/page.tsx
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import components to avoid hydration issues
const ChatList = dynamic(() => import('@/components/chat/ChatList'), {
  ssr: false,
  loading: () => <div className="h-[600px] border rounded-lg animate-pulse bg-muted/20"></div>
});

const ChatWindow = dynamic(() => import('@/components/chat/ChatWindow').then(mod => mod.ChatWindow), {
  ssr: false,
  loading: () => <div className="h-[600px] border rounded-lg animate-pulse bg-muted/20"></div>
});

// Dynamic import for Alert components
const Alert = dynamic(() => import('@/components/ui/alert').then(mod => mod.Alert), { ssr: false });
const AlertTitle = dynamic(() => import('@/components/ui/alert').then(mod => mod.AlertTitle), { ssr: false });
const AlertDescription = dynamic(() => import('@/components/ui/alert').then(mod => mod.AlertDescription), { ssr: false });

// Dynamic import for icons and button
const Button = dynamic(() => import('@/components/ui/button').then(mod => mod.Button), { ssr: false });
const AlertCircle = dynamic(() => import('lucide-react').then(mod => mod.AlertCircle), { ssr: false });
const RefreshCw = dynamic(() => import('lucide-react').then(mod => mod.RefreshCw), { ssr: false });

// For socket hook - create a stub version initially
const useSocketStub = () => ({ connectionError: false });
const UseSocketComponent = dynamic(
  () => import('@/hooks/useSocket').then((mod) => {
    // Return a component that uses the hook and exposes its value
    const UseSocketWrapper = ({ children }: { children: (data: any) => React.ReactNode }) => {
      const socketData = mod.useSocket();
      return <>{children(socketData)}</>;
    };
    return UseSocketWrapper;
  }),
  { ssr: false }
);

export default function ChatPage() {
  const { data: session, status } = useSession();
  const [selectedChat, setSelectedChat] = useState<any>(null);

  // Force a refresh if there's a connection error
  const handleRefresh = () => {
    window.location.reload();
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>

      <UseSocketComponent>
        {(socketData) => (
          <>
            {socketData.connectionError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Connection Error</AlertTitle>
                <div className="flex items-center justify-between">
                  <AlertDescription>
                    Unable to connect to the chat server. Some features may be limited.
                  </AlertDescription>
                  <Button variant="outline" size="sm" onClick={handleRefresh} className="ml-4">
                    <RefreshCw className="h-4 w-4 mr-2" /> Retry
                  </Button>
                </div>
              </Alert>
            )}

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
                  <div className="flex items-center justify-center h-[600px] border rounded-lg">
                    <p className="text-muted-foreground">
                      Select a chat to start messaging
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </UseSocketComponent>
    </div>
  );
}