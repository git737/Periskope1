'use client';

import { useAuth, useChat } from "@/app/providers";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { Menu, Info, MoreVertical } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useState } from "react";

export function ChatHeader({ 
  onMenuClick 
}: { 
  onMenuClick: () => void;
}) {
  const { user } = useAuth();
  const { currentRoom, users } = useChat();
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  
  if (!currentRoom || !user) return null;

  const formatRoomName = () => {
    if (currentRoom.is_direct) {
      const otherParticipantId = currentRoom.participants.find(id => id !== user.id);
      if (otherParticipantId && users[otherParticipantId]) {
        return users[otherParticipantId].full_name || users[otherParticipantId].email;
      }
    }
    return currentRoom.name;
  };

  const getParticipantAvatar = () => {
    if (currentRoom.is_direct) {
      const otherParticipantId = currentRoom.participants.find(id => id !== user.id);
      if (otherParticipantId) {
        return users[otherParticipantId] || null;
      }
    }
    return null;
  };

  const otherUser = getParticipantAvatar();

  return (
    <div className="h-16 px-4 border-b flex items-center justify-between bg-card/80 backdrop-blur-sm">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center">
          {otherUser ? (
            <UserAvatar user={otherUser} showStatus className="h-9 w-9 mr-3" />
          ) : (
            <Avatar className="h-9 w-9 mr-3">
              <AvatarFallback>
                {currentRoom.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <div>
            <h2 className="font-medium text-base">{formatRoomName()}</h2>
            {otherUser?.status === 'online' ? (
              <p className="text-xs text-muted-foreground">Online</p>
            ) : otherUser?.last_seen ? (
              <p className="text-xs text-muted-foreground">
                Last seen {formatDistanceToNow(new Date(otherUser.last_seen), { addSuffix: true })}
              </p>
            ) : currentRoom.is_direct ? (
              <p className="text-xs text-muted-foreground">Offline</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                {currentRoom.participants.length} members
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center">
        <Sheet open={isInfoOpen} onOpenChange={setIsInfoOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Info className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Conversation Info</SheetTitle>
            </SheetHeader>
            <div className="py-6">
              <div className="flex flex-col items-center justify-center mb-6">
                {otherUser ? (
                  <UserAvatar user={otherUser} className="h-20 w-20 mb-4" />
                ) : (
                  <Avatar className="h-20 w-20 mb-4">
                    <AvatarFallback>
                      {currentRoom.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <h3 className="text-lg font-medium">{formatRoomName()}</h3>
                {otherUser ? (
                  <p className="text-sm text-muted-foreground">{otherUser.email}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Created {formatDistanceToNow(new Date(currentRoom.created_at), { addSuffix: true })}</p>
                )}
              </div>
              
              {!currentRoom.is_direct && (
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Members</h4>
                  <div className="space-y-2">
                    {currentRoom.participants.map(participantId => {
                      const participant = users[participantId];
                      if (!participant) return null;
                      
                      return (
                        <div key={participantId} className="flex items-center">
                          <UserAvatar user={participant} showStatus className="h-8 w-8 mr-2" />
                          <div>
                            <p className="text-sm font-medium">
                              {participant.full_name || participant.email}
                              {participant.id === user.id && " (You)"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {participant.status === 'online' ? 'Online' : 'Offline'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsInfoOpen(true)}>
              View Info
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Clear Messages</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}