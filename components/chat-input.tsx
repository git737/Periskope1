'use client';

import { useAuth, useChat } from "@/app/providers";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Send, Smile } from "lucide-react";
import { KeyboardEvent, useState } from "react";
import { cn } from "@/lib/utils";
import { FaThumbtack, FaRegSmile, FaRegClock } from 'react-icons/fa';
import { GoPaperclip } from "react-icons/go";
import { CiFaceSmile } from "react-icons/ci";
import { GoClock } from "react-icons/go";
import { PiClockClockwiseLight } from "react-icons/pi";
import { IoMdStarOutline } from "react-icons/io";
import { PiNoteFill } from "react-icons/pi";
import { TiMicrophone } from "react-icons/ti";
import { IoSend } from "react-icons/io5";


export function ChatInput() {
  const { user } = useAuth();
  const { currentRoom, sendMessage } = useChat();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  if (!user || !currentRoom) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Emit typing status
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true);
      // You could implement typing indicator here with a channel
      setTimeout(() => setIsTyping(false), 2000);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Shift+Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (message.trim()) {
      await sendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="p-4 border-t bg-background">
  <div className="flex flex-col gap-2">
    {/* Textarea and Send Button */}
    <div className="flex items-end gap-2">
      <Textarea
        placeholder="Type a message..."
        className="min-h-[30px] max-h-[200px] py-3 px-4 resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        value={message}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />

      <button       
        disabled={!message.trim()}
        onClick={handleSendMessage}
      >
        <IoSend className="h-5 w-5 text-green-700" />
      </button>
    </div>

    {/* Icon Row Below Textarea */}
    <div className="flex items-center gap-4 text-muted-foreground text-sm pl-2">
      <button className="hover:text-green-500 transition">
        <GoPaperclip className="h-5 w-5" />
      </button>
      <button title="Emoji" className="hover:text-green-500 transition">
        <CiFaceSmile className="h-5 w-5" />
      </button>
      <button title="Schedule" className="hover:text-green-500 transition">
        <GoClock className="h-5 w-5" />
      </button>
      <button title="Schedule" className="hover:text-green-500 transition">
        <PiClockClockwiseLight className="h-5 w-5" />
      </button>
      <button title="Schedule" className="hover:text-green-500 transition">
        <GoClock className="h-5 w-5" />
      </button>
      <button title="Schedule" className="hover:text-green-500 transition">
        <IoMdStarOutline className="h-5 w-5" />
      </button>
      <button title="Schedule" className="hover:text-green-500 transition">
        <PiNoteFill className="h-5 w-5" />
      </button>
      <button title="Schedule" className="hover:text-green-500 transition">
        <TiMicrophone className="h-5 w-5" />
      </button>
    </div>
  </div>
</div>
  );
}