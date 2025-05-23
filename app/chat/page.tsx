'use client';

import { useEffect, useState } from "react";
import { useAuth, useChat } from "@/app/providers";
import { useRouter } from "next/navigation";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ChatHeader } from "@/components/chat-header";
import { ChatInput } from "@/components/chat-input";
import { ChatMessages } from "@/components/chat-messages";
import { EmptyState } from "@/components/empty-state";
import { IconBar } from "@/components/left-sidebar";
import { TopBar } from "@/components/top-bar";
import { RightSideBar } from "@/components/right-sidebar";

export default function ChatPage() {
  const { user, loading } = useAuth();
  const { currentRoom, setCurrentRoom } = useChat();
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (    
    <>
    <TopBar/>
     <IconBar />    
     < RightSideBar />  
    <div className="flex h-screen flex-col md:flex-row overflow-hidden bg-background ml-16 mr-16 pt-10">      
      <ChatSidebar      
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
      
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {currentRoom ? (
          <>
           
            <ChatHeader 
              onMenuClick={() => setIsMobileSidebarOpen(true)}
            />
            <ChatMessages />
            <ChatInput />
          </>
        ) : (
          <EmptyState 
            title="No conversation selected"
            description="Select a conversation or start a new one"
            onMenuClick={() => setIsMobileSidebarOpen(true)}
          />
        )}
      </div>
    </div>
    </>
  );
}