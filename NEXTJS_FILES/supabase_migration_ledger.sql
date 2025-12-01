/*
  # Add Ledger Entries Table

  1. New Table
    - `ledger_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key) - references users table
      - `kind` (text) - type of transaction (DEPOSIT, WITHDRAWAL, BET_PLACE, BET_WIN, BET_LOSS, ADMIN_ADJUSTMENT)
      - `amount` (numeric) - transaction amount
      - `meta` (jsonb) - additional metadata
      - `created_at` (timestamptz) - timestamp

  2. Security
    - Enable RLS on ledger_entries table
    - Users can view their own ledger entries
*/

CREATE TABLE IF NOT EXISTS ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  kind text NOT NULL,
  amount numeric NOT NULL,
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ledger entries"
  ON ledger_entries FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE privy_id = current_setting('request.jwt.claims', true)::json->>'sub'));

CREATE INDEX IF NOT EXISTS idx_ledger_entries_user_id ON ledger_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_kind ON ledger_entries(kind);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_created_at ON ledger_entries(created_at);
