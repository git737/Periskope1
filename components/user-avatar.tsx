'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/app/providers";
import { cn } from "@/lib/utils";

export function UserAvatar({ 
  user, 
  className,
  showStatus = false
}: { 
  user: User | null;
  className?: string;
  showStatus?: boolean;
}) {
  if (!user) return null;
  
  const initials = user.full_name
    ? user.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
    : user.email.substring(0, 2).toUpperCase();

  return (
    <div className="relative">
      <Avatar className={cn("h-8 w-8", className)}>
        <AvatarImage src={user.avatar_url || undefined} alt={user.full_name || user.email} />
        <AvatarFallback>
          {initials}
        </AvatarFallback>
      </Avatar>
      {showStatus && user.status && (
        <span 
          className={cn(
            "absolute bottom-0 right-0 h-2 w-2 rounded-full border border-background",
            user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
          )}
        />
      )}
    </div>
  );
}