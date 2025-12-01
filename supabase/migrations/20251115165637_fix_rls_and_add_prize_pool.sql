/*
  # Fix RLS Policies and Add Prize Pool Functionality

  1. Changes to Users Table
    - Allow anonymous user creation (needed for Privy registration)
    - Set default balance to 0 (no test balance)
  
  2. Changes to Events Table
    - Add `prize_pool` column to track total amount in the event
    - Add `winner_side` column to track which prediction won
    
  3. Security Updates
    - Update RLS policies to allow user creation during registration
    - Add public read access for events (before login)

  4. Prize Distribution
    - Prize pool accumulates all bets
    - Winners split the prize pool proportionally
*/

-- Drop old policies that are too restrictive
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Anyone can view events" ON events;

-- Add prize_pool and winner_side columns to events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'prize_pool'
  ) THEN
    ALTER TABLE events ADD COLUMN prize_pool numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'winner_side'
  ) THEN
    ALTER TABLE events ADD COLUMN winner_side text;
  END IF;
END $$;

-- Update default balance to 0 for new users
ALTER TABLE users ALTER COLUMN balance SET DEFAULT 0;

-- New users policies (allow anyone to register)
CREATE POLICY "Anyone can create user profile"
  ON users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view user profiles"
  ON users FOR SELECT
  USING (true);

-- Allow public to view events (before login)
CREATE POLICY "Public can view events"
  ON events FOR SELECT
  USING (true);

-- Create function to distribute prizes
CREATE OR REPLACE FUNCTION distribute_prize(event_uuid uuid)
RETURNS void AS $$
DECLARE
  event_record RECORD;
  total_winning_amount numeric;
  bet_record RECORD;
  payout_amount numeric;
BEGIN
  -- Get event details
  SELECT * INTO event_record FROM events WHERE id = event_uuid;
  
  IF event_record.status != 'FINAL' OR event_record.winner_side IS NULL THEN
    RAISE EXCEPTION 'Event must be finalized with a winner';
  END IF;

  -- Calculate total amount bet on winning side
  SELECT COALESCE(SUM(amount), 0) INTO total_winning_amount
  FROM bets
  WHERE event_id = event_uuid AND prediction = event_record.winner_side;

  -- If no winning bets, refund everyone
  IF total_winning_amount = 0 THEN
    FOR bet_record IN
      SELECT * FROM bets WHERE event_id = event_uuid AND status = 'ACTIVE'
    LOOP
      UPDATE users SET balance = balance + bet_record.amount
      WHERE id = bet_record.user_id;
      
      UPDATE bets SET status = 'REFUNDED'
      WHERE id = bet_record.id;
    END LOOP;
    RETURN;
  END IF;

  -- Distribute prize proportionally to winners
  FOR bet_record IN
    SELECT * FROM bets 
    WHERE event_id = event_uuid 
    AND prediction = event_record.winner_side 
    AND status = 'ACTIVE'
  LOOP
    -- Calculate payout: (user_bet / total_winning_bets) * total_prize_pool
    payout_amount := (bet_record.amount / total_winning_amount) * event_record.prize_pool;
    
    -- Add payout to user balance
    UPDATE users SET balance = balance + payout_amount
    WHERE id = bet_record.user_id;
    
    -- Mark bet as won
    UPDATE bets SET status = 'WON'
    WHERE id = bet_record.id;
  END LOOP;

  -- Mark losing bets
  UPDATE bets SET status = 'LOST'
  WHERE event_id = event_uuid 
  AND prediction != event_record.winner_side 
  AND status = 'ACTIVE';

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
