/*
  # Initial schema setup for chat application

  1. New Tables
    - `users` - Stores user profiles
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `full_name` (text, nullable)
      - `avatar_url` (text, nullable)
      - `status` (text, default 'offline')
      - `last_seen` (timestamp, nullable)
      - `created_at` (timestamp)
    
    - `rooms` - Stores chat rooms
      - `id` (uuid, primary key)
      - `name` (text)
      - `is_direct` (boolean)
      - `participants` (array of uuid)
      - `created_at` (timestamp)
    
    - `messages` - Stores chat messages
      - `id` (uuid, primary key)
      - `room_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `content` (text)
      - `read_by` (array of uuid)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read their own data and messages in rooms they participate in
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  status text DEFAULT 'offline',
  last_seen timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  is_direct boolean DEFAULT false,
  participants uuid[] NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms ON DELETE CASCADE,
  user_id uuid REFERENCES users ON DELETE CASCADE,
  content text NOT NULL,
  read_by uuid[] DEFAULT ARRAY[]::uuid[],
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for rooms
CREATE POLICY "Users can view rooms they participate in"
  ON rooms
  FOR SELECT
  TO authenticated
  USING (auth.uid() = ANY(participants));

CREATE POLICY "Users can create rooms"
  ON rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = ANY(participants));

CREATE POLICY "Users can update rooms they participate in"
  ON rooms
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = ANY(participants));

-- RLS Policies for messages
CREATE POLICY "Users can view messages in rooms they participate in"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rooms
      WHERE id = messages.room_id
      AND auth.uid() = ANY(participants)
    )
  );

CREATE POLICY "Users can insert messages in rooms they participate in"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rooms
      WHERE id = messages.room_id
      AND auth.uid() = ANY(participants)
    )
    AND auth.uid() = user_id
  );

CREATE POLICY "Users can update message read status"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rooms
      WHERE id = messages.room_id
      AND auth.uid() = ANY(participants)
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages (room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at);
CREATE INDEX IF NOT EXISTS idx_rooms_participants ON rooms USING GIN (participants);