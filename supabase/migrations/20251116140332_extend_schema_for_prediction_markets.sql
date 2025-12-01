/*
  # Extend Schema for Prediction Market Architecture

  1. Changes to Users Table
    - Rename `balance` → kept for backward compatibility
    - Already has `balance_available` (numeric, default 0)
    - Already has `balance_locked` (numeric, default 0)
    - Ensure `wallet_address` can store Solana addresses

  2. New Table: market_resolutions
    - `id` (uuid, primary key)
    - `market_id` (uuid, FK → events.id, unique)
    - `winning_side` (text: "YES" or "NO")
    - `resolved_at` (timestamptz)

  3. New Table: deposits
    - `id` (uuid, primary key)
    - `user_id` (uuid, FK → users.id)
    - `status` (text: "PENDING" | "CONFIRMED" | "FAILED")
    - `amount` (numeric)
    - `from_address` (text)
    - `tx_signature` (text, nullable)
    - `memo` (text, nullable)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  4. Changes to Bets Table
    - Add `payout` column (numeric, nullable) - for storing winning payout amount

  5. Ledger Entries Table
    - Already exists with correct structure

  6. Events Table Updates
    - Add `description` column for longer market descriptions
    - Rename conceptually: events → markets (but keep table name for compatibility)
    - `status` values: "OPEN" | "CLOSED" | "RESOLVED"
    - `winner_side` already exists

  7. Security
    - Enable RLS on new tables
    - Add appropriate policies
*/

-- Add description column to events if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'description'
  ) THEN
    ALTER TABLE events ADD COLUMN description text;
  END IF;
END $$;

-- Add payout column to bets if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bets' AND column_name = 'payout'
  ) THEN
    ALTER TABLE bets ADD COLUMN payout numeric;
  END IF;
END $$;

-- Create market_resolutions table
CREATE TABLE IF NOT EXISTS market_resolutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id uuid REFERENCES events(id) ON DELETE CASCADE UNIQUE NOT NULL,
  winning_side text NOT NULL CHECK (winning_side IN ('YES', 'NO')),
  resolved_at timestamptz DEFAULT now()
);

-- Create deposits table (for future on-chain integration)
CREATE TABLE IF NOT EXISTS deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'FAILED')),
  amount numeric NOT NULL,
  from_address text NOT NULL,
  tx_signature text,
  memo text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE market_resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;

-- Market resolutions policies (public read)
CREATE POLICY "Anyone can view market resolutions"
  ON market_resolutions FOR SELECT
  USING (true);

-- Deposits policies
CREATE POLICY "Users can view own deposits"
  ON deposits FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE privy_id = current_setting('request.jwt.claims', true)::json->>'sub'));

CREATE POLICY "Users can create own deposits"
  ON deposits FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE privy_id = current_setting('request.jwt.claims', true)::json->>'sub'));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_market_resolutions_market_id ON market_resolutions(market_id);
CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);
CREATE INDEX IF NOT EXISTS idx_bets_prediction ON bets(prediction);
CREATE INDEX IF NOT EXISTS idx_events_status_expires ON events(status, expires_at);

-- Add updated_at trigger to deposits
CREATE TRIGGER update_deposits_updated_at BEFORE UPDATE ON deposits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
