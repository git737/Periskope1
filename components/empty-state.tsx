'use client';

import { Button } from "@/components/ui/button";
import { Menu, MessageSquare } from "lucide-react";

export function EmptyState({ 
  title,
  description,
  onMenuClick
}: {
  title: string;
  description: string;
  onMenuClick: () => void;
}) {
  return (
    <div className="h-screen flex flex-col">
      <div className="h-16 px-4 border-b flex items-center">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <MessageSquare className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-medium">{title}</h3>
        <p className="text-muted-foreground mt-2 max-w-sm">
          {description}
        </p>
        
        <Button className="mt-6" onClick={onMenuClick}>
          Start a conversation
        </Button>
      </div>
    </div>
  );
}