/*
  # Add username to users table

  1. Changes
    - Add `username` column to `users` table (unique, nullable initially)
    - Add index on username for fast lookups
    - Users will set their username on first login
  
  2. Security
    - No changes to RLS policies needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'username'
  ) THEN
    ALTER TABLE users ADD COLUMN username text UNIQUE;
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  END IF;
END $$;