export interface User {
  id: string;
  privy_id: string;
  wallet_address: string | null;
  email: string | null;
  balance: number;
  balance_available: number;
  balance_locked: number;
  username: string | null;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  creator_id: string;
  title: string;
  description?: string | null;
  creator_bet_amount: number;
  total_spots: number;
  spots_taken: number;
  prize_pool: number;
  winner_side: 'YES' | 'NO' | null;
  status: 'OPEN' | 'CLOSED' | 'RESOLVED' | 'LOCKED' | 'FINAL' | 'CANCELED';
  result: 'YES' | 'NO' | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  creator?: User;
  yes_volume?: number;
  no_volume?: number;
}

export interface Bet {
  id: string;
  event_id: string;
  user_id: string;
  amount: number;
  prediction: 'YES' | 'NO';
  status: 'ACTIVE' | 'WON' | 'LOST' | 'REFUNDED';
  payout?: number | null;
  created_at: string;
  user?: User;
}

export interface MarketResolution {
  id: string;
  market_id: string;
  winning_side: 'YES' | 'NO';
  resolved_at: string;
}

export interface Deposit {
  id: string;
  user_id: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  amount: number;
  from_address: string;
  tx_signature: string | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
}

export interface LedgerEntry {
  id: string;
  user_id: string | null;
  kind: 'DEPOSIT' | 'WITHDRAWAL' | 'BET_PLACE' | 'BET_WIN' | 'BET_LOSS' | 'ADMIN_ADJUSTMENT';
  amount: number;
  meta: any;
  created_at: string;
}

export type Market = Event;
