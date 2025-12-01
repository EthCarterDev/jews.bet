/*
  # Create Betting Platform Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - Unique user identifier
      - `privy_id` (text, unique) - Privy authentication ID
      - `wallet_address` (text) - Solana wallet address
      - `balance` (numeric) - User's betting balance in SOL
      - `username` (text) - Display name
      - `created_at` (timestamptz) - Account creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

    - `events`
      - `id` (uuid, primary key) - Unique event identifier
      - `creator_id` (uuid, foreign key) - References users table
      - `title` (text) - Event description/question
      - `creator_bet_amount` (numeric) - Amount creator is betting
      - `total_spots` (int) - Maximum number of bets allowed
      - `spots_taken` (int) - Current number of bets placed
      - `status` (text) - Event status: OPEN, LOCKED, FINAL, CANCELED
      - `result` (text) - Final result: YES, NO, or null
      - `expires_at` (timestamptz) - Event expiration time
      - `created_at` (timestamptz) - Event creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

    - `bets`
      - `id` (uuid, primary key) - Unique bet identifier
      - `event_id` (uuid, foreign key) - References events table
      - `user_id` (uuid, foreign key) - References users table
      - `amount` (numeric) - Bet amount in SOL
      - `prediction` (text) - User's prediction: YES or NO
      - `status` (text) - Bet status: ACTIVE, WON, LOST, REFUNDED
      - `created_at` (timestamptz) - Bet creation timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to:
      - Read all users (public profiles)
      - Update only their own profile
      - Read all events
      - Create events if authenticated
      - Update events they created
      - Read all bets
      - Create bets if authenticated
      - Read their own bets
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  privy_id text UNIQUE NOT NULL,
  wallet_address text,
  balance numeric DEFAULT 0,
  username text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  creator_bet_amount numeric NOT NULL DEFAULT 0,
  total_spots int NOT NULL DEFAULT 10,
  spots_taken int DEFAULT 0,
  status text DEFAULT 'OPEN',
  result text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bets table
CREATE TABLE IF NOT EXISTS bets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL,
  prediction text NOT NULL,
  status text DEFAULT 'ACTIVE',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (privy_id = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (privy_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Events policies
CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Creators can update own events"
  ON events FOR UPDATE
  TO authenticated
  USING (creator_id IN (SELECT id FROM users WHERE privy_id = current_setting('request.jwt.claims', true)::json->>'sub'))
  WITH CHECK (creator_id IN (SELECT id FROM users WHERE privy_id = current_setting('request.jwt.claims', true)::json->>'sub'));

-- Bets policies
CREATE POLICY "Users can view all bets"
  ON bets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create bets"
  ON bets FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_privy_id ON users(privy_id);
CREATE INDEX IF NOT EXISTS idx_events_creator_id ON events(creator_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_bets_event_id ON bets(event_id);
CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();