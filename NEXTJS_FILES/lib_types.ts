export interface User {
  id: string;
  privy_id: string;
  email: string | null;
  wallet_address: string | null;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface Market {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  creator_bet_amount: number;
  total_spots: number;
  spots_taken: number;
  prize_pool: number;
  winner_side: 'YES' | 'NO' | null;
  status: 'OPEN' | 'LOCKED' | 'FINAL' | 'CANCELED';
  result: 'YES' | 'NO' | null;
  closes_at: string;
  created_at: string;
  updated_at: string;
  creator?: User;
}

export interface Bet {
  id: string;
  event_id: string;
  user_id: string;
  amount: number;
  prediction: 'YES' | 'NO';
  status: 'ACTIVE' | 'WON' | 'LOST' | 'REFUNDED';
  created_at: string;
  user?: User;
}

export interface LedgerEntry {
  id: string;
  user_id: string | null;
  kind: LedgerKind;
  amount: number;
  meta: Record<string, any> | null;
  created_at: string;
}

export enum LedgerKind {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  BET_PLACE = 'BET_PLACE',
  BET_WIN = 'BET_WIN',
  BET_LOSS = 'BET_LOSS',
  ADMIN_ADJUSTMENT = 'ADMIN_ADJUSTMENT',
}

export interface MarketStats {
  yesVolume: number;
  noVolume: number;
  totalBets: number;
}
