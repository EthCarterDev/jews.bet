/*
  # Fix username unique constraint

  1. Changes
    - Add unique constraint to username column
    - This enables username uniqueness checking
  
  2. Notes
    - Previous migration didn't apply the unique constraint properly
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_username_key'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);
  END IF;
END $$;