'use client';

import { useAuth, useChat, Message as MessageType } from "@/app/providers";
import { useEffect, useRef } from "react";
import { UserAvatar } from "@/components/user-avatar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CheckIcon, CheckCheckIcon } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

function MessageStatus({ message }: { message: MessageType }) {
  const readCount = message.read_by?.length || 0;
  
  if (readCount <= 1) {
    return <CheckIcon className="h-3.5 w-3.5 text-muted-foreground/70" />;
  } else {
    return <CheckCheckIcon className="h-3.5 w-3.5 text-primary" />;
  }
}

function MessageItem({ message, isOwn, showAvatar, user }: { 
  message: MessageType;
  isOwn: boolean;
  showAvatar: boolean;
  user: any;
}) {
  const { users } = useChat();
  const messageUser = users[message.user_id];

  return (
    <div className={cn(
      "flex items-end mb-4",
      isOwn ? "justify-end" : "justify-start"
    )}>
      {!isOwn && showAvatar ? (
        <UserAvatar user={messageUser} className="h-8 w-8 mr-2 mb-4" />
      ) : !isOwn ? (
        <div className="w-8 mr-2" />
      ) : null}
      <div className={cn(
        "max-w-[85%] px-4 py-2 rounded-xl",
        isOwn 
          ? "bg-green-300 text-black-200 rounded-br-none animate-in slide-in-from-right-2" 
          : "bg-gray-50 text-black rounded-bl-none animate-in slide-in-from-left-2"
      )}>
        {!isOwn && showAvatar && (
          <div className="font-medium text-xs mb-1">
            {messageUser?.full_name || messageUser?.email || "Unknown user"}
          </div>
        )}
        <div className="space-y-1">
          <p className="text-sm leading-relaxed break-words">{message.content}</p>
          <div className="flex items-center justify-end gap-1 -mr-1">
            <span className="text-[10px] opacity-70">
              {format(new Date(message.created_at), 'HH:mm')}
            </span>
            {isOwn && <MessageStatus message={message} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChatMessages() {
  const { user } = useAuth();
  const { messages, currentRoom } = useChat();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const wasAtBottom = useRef(true);
  
  // Auto-scroll to bottom when messages are added
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea && wasAtBottom.current) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);

  // Handle scroll events to determine if user is at bottom
  const handleScroll = () => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      const isAtBottom = 
        scrollArea.scrollHeight - scrollArea.clientHeight - scrollArea.scrollTop < 30;
      wasAtBottom.current = isAtBottom;
    }
  };

  if (!user || !currentRoom) return null;

  // Group messages by day
  const messagesByDay: { [key: string]: MessageType[] } = {};
  messages.forEach(message => {
    const day = format(new Date(message.created_at), 'yyyy-MM-dd');
    if (!messagesByDay[day]) {
      messagesByDay[day] = [];
    }
    messagesByDay[day].push(message);
  });

  return (
    <ScrollArea 
      ref={scrollAreaRef} 
      className="flex-1 p-4 overflow-y-auto"
     style={{
    backgroundImage: "url('/wahatsapp-bg.png')",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    filter: "brightness(1.16)"
  }}
      onScroll={handleScroll}
    >
      {Object.entries(messagesByDay).map(([day, dayMessages]) => (
        <div key={day} className="mb-6">
          <div className="flex justify-center mb-4">
            <div className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs">
              {format(new Date(day), 'dd-MM-yyyy')}
            </div>
          </div>
          <div>
            {dayMessages.map((message, index) => {
              const isOwn = message.user_id === user.id;
              // Determine if we should show the avatar (first message or different sender)
              const showAvatar = index === 0 || 
                dayMessages[index - 1].user_id !== message.user_id;

              return (
                <MessageItem 
                  key={message.id} 
                  message={message} 
                  isOwn={isOwn} 
                  showAvatar={showAvatar}
                  user={user}
                />
              );
            })}
          </div>
        </div>
      ))}
      {messages.length === 0 && (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          <p>No messages yet. Start the conversation!</p>
        </div>
      )}
    </ScrollArea>
  );
}