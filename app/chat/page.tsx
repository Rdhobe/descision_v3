// app/chat/page.tsx
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { ChatList } from '@/components/chat/ChatList';
import { ChatWindow } from '@/components/chat/ChatWindow';

export default function ChatPage() {
  const { data: session, status } = useSession();
  const [selectedChat, setSelectedChat] = useState<any>(null);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
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
    </div>
  );
}