/*
  # Add email column to users table

  1. Changes
    - Add `email` column to users table (nullable text field)
    - Add index on email for faster lookups
*/

-- Add email column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'email'
  ) THEN
    ALTER TABLE public.users ADD COLUMN email text;
  END IF;
END $$;

-- Add index on email
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
