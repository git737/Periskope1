'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { ThemeProvider } from 'next-themes';

// Define types
export type User = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  last_seen?: string;
  status?: 'online' | 'offline';
};

export type Message = {
  id: string;
  user_id: string;
  room_id: string;
  content: string;
  created_at: string;
  read_by: string[];
};

export type Room = {
  id: string;
  name: string;
  created_at: string;
  is_direct: boolean;
  participants: string[];
  last_message?: string;
  last_message_at?: string;
};

// Create Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Create a context for authentication
type AuthContextType = {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a context for chat
type ChatContextType = {
  rooms: Room[];
  currentRoom: Room | null;
  messages: Message[];
  users: Record<string, User>;
  setCurrentRoom: (room: Room | null) => void;
  sendMessage: (content: string) => Promise<void>;
  createRoom: (name: string, participants: string[], isDirect: boolean) => Promise<string>;
  fetchRooms: () => Promise<void>;
  fetchMessages: (roomId: string) => Promise<void>;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider component
export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const router = useRouter();
  const { toast } = useToast();

  // Check for session on load
  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session?.user?.id) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (data) {
          setUser(data as User);
        }
      }
      
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.id) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (data) {
          setUser(data as User);
        }
        router.refresh();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        router.push('/login');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  // Set up real-time presence updates when user is signed in
  useEffect(() => {
    if (!user) return;

    // Update user status to online
    const updatePresence = async () => {
      await supabase
        .from('users')
        .update({ status: 'online', last_seen: new Date().toISOString() })
        .eq('id', user.id);
    };

    updatePresence();

    // Listen for presence changes
    const presenceChannel = supabase.channel('online-users');
    
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        fetchUsers();
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ user_id: user.id });
        }
      });

    // Set up window events to track when user leaves
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updatePresence();
      } else {
        supabase
          .from('users')
          .update({ status: 'offline', last_seen: new Date().toISOString() })
          .eq('id', user.id);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      presenceChannel.unsubscribe();
      supabase
        .from('users')
        .update({ status: 'offline', last_seen: new Date().toISOString() })
        .eq('id', user.id);
    };
  }, [user]);

  // Real-time message subscription for all rooms
  useEffect(() => {
    if (!user) return;

    // Subscribe to all rooms the user is part of
    const messageSubscription = supabase
      .channel('room_messages')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'messages',
        filter: `room_id=eq.${currentRoom?.id}`
      }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
          
          // Update room's last message
          if (currentRoom) {
            setRooms(prev => prev.map(room => 
              room.id === currentRoom.id
                ? {
                    ...room,
                    last_message: newMessage.content,
                    last_message_at: newMessage.created_at
                  }
                : room
            ));
          }

          // Mark message as read if from another user
          if (newMessage.user_id !== user.id) {
            await supabase
              .from('messages')
              .update({ 
                read_by: [...(newMessage.read_by || []), user.id]
              })
              .eq('id', newMessage.id);
          }
        }
      })
      .subscribe();

    return () => {
      messageSubscription.unsubscribe();
    };
  }, [user, currentRoom]);

  // Authentication functions
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data: { user: authUser }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) throw error;

      if (authUser) {
        await supabase.from('users').insert([
          { 
            id: authUser.id, 
            email, 
            full_name: fullName,
            avatar_url: null,
            status: 'online'
          }
        ]);

        toast({
          title: "Account created!",
          description: "You've successfully signed up."
        });
        
        router.push('/chat');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing up",
        description: error.message
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in."
      });
      
      router.push('/chat');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing in",
        description: error.message
      });
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You've been logged out successfully."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message
      });
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setUser(prev => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating profile",
        description: error.message
      });
    }
  };

  // Chat functions
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');

      if (error) throw error;

      const usersMap = (data as User[]).reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {} as Record<string, User>);

      setUsers(usersMap);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          messages (
            content,
            created_at,
            user_id,
            read_by
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter rooms where user is a participant
      const userRooms = data
        .filter(room => room.participants.includes(user.id))
        .map(room => ({
          ...room,
          last_message: room.messages?.[0]?.content || null,
          last_message_at: room.messages?.[0]?.created_at || null
        }));

      setRooms(userRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchMessages = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data);

      // Mark messages as read
      if (user) {
        const unreadMessages = data.filter(
          msg => msg.user_id !== user.id && !msg.read_by?.includes(user.id)
        );

        for (const msg of unreadMessages) {
          await supabase
            .from('messages')
            .update({ 
              read_by: [...(msg.read_by || []), user.id]
            })
            .eq('id', msg.id);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (content: string) => {
    try {
      if (!user || !currentRoom) throw new Error("Not authenticated or no room selected");

      const { data, error } = await supabase
        .from('messages')
        .insert([
          { 
            user_id: user.id, 
            room_id: currentRoom.id, 
            content,
            read_by: [user.id]
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Optimistically update the messages list
      setMessages(prev => [...prev, data]);
      
      // Update room's last message
      setRooms(prev => prev.map(room => 
        room.id === currentRoom.id
          ? {
              ...room,
              last_message: content,
              last_message_at: new Date().toISOString()
            }
          : room
      ));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error sending message",
        description: error.message
      });
    }
  };

  const createRoom = async (name: string, participants: string[], isDirect: boolean) => {
    try {
      if (!user) throw new Error("Not authenticated");

      // Ensure creator is included in participants
      if (!participants.includes(user.id)) {
        participants.push(user.id);
      }

      const { data, error } = await supabase
        .from('rooms')
        .insert([
          { 
            name, 
            participants,
            is_direct: isDirect
          }
        ])
        .select();

      if (error) throw error;

      toast({
        title: isDirect ? "Conversation started" : "Room created",
        description: isDirect ? "You can now start chatting" : `Room "${name}" has been created`
      });

      await fetchRooms();
      return data[0].id;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating room",
        description: error.message
      });
      throw error;
    }
  };

  // Initialize rooms and users when user signs in
  useEffect(() => {
    if (user) {
      fetchRooms();
      fetchUsers();
    }
  }, [user]);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthContext.Provider
        value={{
          user,
          loading,
          signUp,
          signIn,
          signOut,
          updateProfile
        }}
      >
        <ChatContext.Provider
          value={{
            rooms,
            currentRoom,
            messages,
            users,
            setCurrentRoom,
            sendMessage,
            createRoom,
            fetchRooms,
            fetchMessages
          }}
        >
          {children}
          <Toaster />
        </ChatContext.Provider>
      </AuthContext.Provider>
    </ThemeProvider>
  );
}

// Custom hooks to access context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}