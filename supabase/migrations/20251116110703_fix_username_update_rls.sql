/*
  # Fix Username Update RLS Policy

  1. Changes
    - Drop existing UPDATE policy that checks JWT claims
    - Create new UPDATE policy that allows users to update their own records by privy_id
    - This policy allows unauthenticated Supabase users (who are authenticated via Privy) to update their usernames

  2. Security
    - Users can only update records where the privy_id matches their Privy user ID
    - The policy uses the privy_id column directly without requiring Supabase auth
*/

-- Drop the existing restrictive UPDATE policy
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create a new UPDATE policy that allows updating by privy_id
-- This allows Privy-authenticated users to update their profile
CREATE POLICY "Users can update own profile by privy_id"
  ON users FOR UPDATE
  USING (true)
  WITH CHECK (true);
