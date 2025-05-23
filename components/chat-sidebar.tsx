'use client';

import { useEffect, useState } from "react";
import { useAuth, useChat, Room, User } from "@/app/providers";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/user-avatar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, LogOut, UserPlus, UserCircle, X, Plus, Users, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { IoMdHome } from "react-icons/io";
import { FaFolder, FaSearch, FaFilter } from "react-icons/fa";
import { FaComments } from 'react-icons/fa'; // or any chat icon you prefer
import { TbMessageCirclePlus } from "react-icons/tb";
import { MdFilterList } from "react-icons/md";


export function ChatSidebar({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user, signOut } = useAuth();
  const { rooms, users, currentRoom, setCurrentRoom, createRoom, fetchRooms, fetchMessages } = useChat();
  const [newRoomDialogOpen, setNewRoomDialogOpen] = useState(false);
  const [newDirectDialogOpen, setNewDirectDialogOpen] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedDirectUser, setSelectedDirectUser] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (room.is_direct && room.participants.some(userId => 
      users[userId]?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      users[userId]?.email.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  const handleRoomClick = async (room: Room) => {
    setCurrentRoom(room);
    await fetchMessages(room.id);
    onClose();
  };

  const handleCreateRoom = async () => {
    if (roomName.trim()) {
      await createRoom(roomName, selectedUsers, false);
      setRoomName('');
      setSelectedUsers([]);
      setNewRoomDialogOpen(false);
    }
  };

  const handleCreateDirectMessage = async () => {
    if (selectedDirectUser && user) {
      const participants = [user.id, selectedDirectUser];
      const targetUser = users[selectedDirectUser];
      const roomName = targetUser ? 
        `${user.full_name || user.email} & ${targetUser.full_name || targetUser.email}` : 
        'Direct Message';
      
      const roomId = await createRoom(roomName, participants, true);
      const room = rooms.find(r => r.id === roomId);
      if (room) {
        handleRoomClick(room);
      }
      setSelectedDirectUser('');
      setNewDirectDialogOpen(false);
    }
  };

  const formatParticipants = (room: Room) => {
    if (room.is_direct && user) {
      // For DMs, show the other person's name, not your own
      const otherParticipantId = room.participants.find(id => id !== user.id);
      if (otherParticipantId && users[otherParticipantId]) {
        return users[otherParticipantId].full_name || users[otherParticipantId].email;
      }
      return room.name;
    }
    return room.name;
  };

  const getParticipantAvatar = (room: Room) => {
    if (room.is_direct && user) {
      const otherParticipantId = room.participants.find(id => id !== user.id);
      if (otherParticipantId) {
        return users[otherParticipantId] || null;
      }
    }
    return null;
  };

  const hasUnreadMessages = (room: Room) => {
    // Implementation would check if there are unread messages
    return false;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full ">     
  <div className="flex items-center justify-between gap-2 bg-gray-50 px-5 py-5 h-[55px]">
    {/* Folder + Label */}
    <div className="flex items-center gap-1 whitespace-nowrap">
  <FaFolder className="text-muted-foreground w-4 h-4" />
  <span className="text-xs font-bold text-green-600">Custom Filter</span>
</div>

    {/* Save Button */}
    <button className="px-3 py-1 rounded-md text-xs bg-white transition border border-gray-200">
      Save
    </button>

    {/* Search Box with Icon */}
   <button className="flex items-center gap-1 px-3 py-1 rounded-md text-xs bg-white transition border border-gray-200">
  <FaSearch className="w-3.5 h-3.5 text-muted-foreground" />
  Search
</button>

    {/* Filtered Button */}
    <button className="flex items-center gap-1 px-3 py-1 rounded-md bg-white text-green-700 text-xs border border-gray-200">
      <MdFilterList className="w-3.5 h-3.5" />
      <span className="text-xs font-bold text-green-600">Filtered</span>
    </button>
  </div>
      <Separator className="my-2" />

      <ScrollArea className="flex-1 px-1">
        <div className=" py-1">
           {/* Header Row */}
  
          <div className="space-y-1 mt-2">
            {filteredRooms.length > 0 ? (
              filteredRooms.map((room) => {
                const otherUser = getParticipantAvatar(room);
                const hasUnread = hasUnreadMessages(room);
                
                return (
                  <button
                    key={room.id}
                    onClick={() => handleRoomClick(room)}
                    className={cn(
                      "w-full flex items-center px-3 py-4 text-sm",
                      "transition-colors duration-200 hover:bg-accent",
                      currentRoom?.id === room.id ? "bg-accent" : "",
                      hasUnread ? "font-medium" : ""
                    )}
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      {otherUser ? (
                        <UserAvatar user={otherUser} showStatus className="mr-2 h-9 w-9" />
                      ) : (
                        <Avatar className="mr-2 h-9 w-9">
                          <AvatarFallback>
                            {room.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="truncate font-medium text-sm">
                            {formatParticipants(room)}
                          </p>
                          {room.last_message_at && (
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(room.last_message_at), 'HH:mm')}
                            </span>
                          )}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {room.last_message || "No messages yet"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="py-4 text-center text-sm text-muted-foreground">
                No conversations found
              </div>
            )}
          </div>
            

        </div>
        
      </ScrollArea>
      

      <div className="p-3 mt-auto border-t">
        
        <div className="flex items-center">
          <UserAvatar user={user} className="h-9 w-9" />
          <div className="ml-2 flex-1 min-w-0">
            <p className="font-medium text-sm truncate">
              {user?.full_name || user?.email}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.full_name ? user.email : 'Online'}
            </p>
          </div>
<button
  className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center shadow-lg hover:bg-green-600 transition"
  type="button"
  onClick={() => setNewDirectDialogOpen(true)}
>
  <TbMessageCirclePlus className="w-6 h-6 text-white" />
</button>
          {/* <Button 
            variant="ghost" 
            size="icon"
            onClick={signOut}
            title="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </Button> */}
        </div>
      </div>

      {/* New Group Chat Dialog */}
      <Dialog open={newRoomDialogOpen} onOpenChange={setNewRoomDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                placeholder="Enter group name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Select Members</Label>
              <div className="max-h-60 overflow-y-auto border rounded-md p-2 space-y-2">
                {Object.values(users)
                  .filter(u => u.id !== user?.id)
                  .map(u => (
                    <div key={u.id} className="flex items-center space-x-2">
                      <Button
                        variant={selectedUsers.includes(u.id) ? "default" : "outline"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          if (selectedUsers.includes(u.id)) {
                            setSelectedUsers(selectedUsers.filter(id => id !== u.id));
                          } else {
                            setSelectedUsers([...selectedUsers, u.id]);
                          }
                        }}
                      >
                        <UserAvatar user={u} className="h-6 w-6 mr-2" />
                        <span className="flex-1 text-start truncate">{u.full_name || u.email}</span>
                        {selectedUsers.includes(u.id) && (
                          <CheckCircle className="h-4 w-4 ml-2 text-primary-foreground" />
                        )}
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setNewRoomDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateRoom}>
              Create Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Direct Message Dialog */}
      <Dialog open={newDirectDialogOpen} onOpenChange={setNewDirectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Conversation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="user">Select User</Label>
              <Select value={selectedDirectUser} onValueChange={setSelectedDirectUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(users)
                    .filter(u => u.id !== user?.id)
                    .map(u => (
                      <SelectItem key={u.id} value={u.id}>
                        <div className="flex items-center">
                          <UserAvatar user={u} className="h-6 w-6 mr-2" />
                          <span>{u.full_name || u.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setNewDirectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateDirectMessage} 
              disabled={!selectedDirectUser}
            >
              Start Conversation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar with Sheet component */}
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="left" className="p-0 w-96">
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden md:flex w-96 flex-col border-r h-full">
        {sidebarContent}
      </div>
    </>
  );
}