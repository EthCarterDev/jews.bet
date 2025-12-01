import { supabase } from './supabase';
import { User, Event, Bet, LedgerEntry, Deposit } from '../types';

export interface CreateMarketRequest {
  privyUserId: string;
  question: string;
  description?: string;
  closesAt: string;
}

export interface PlaceBetRequest {
  privyUserId: string;
  marketId: string;
  side: 'YES' | 'NO';
  stake: number;
}

export interface ResolveMarketRequest {
  marketId: string;
  winningSide: 'YES' | 'NO';
}

export const api = {
  async createMarket(request: CreateMarketRequest): Promise<Event> {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('privy_id', request.privyUserId)
      .single();

    if (userError || !user) {
      throw new Error('User not found');
    }

    const { data: market, error: createError } = await supabase
      .from('events')
      .insert({
        creator_id: user.id,
        title: request.question,
        description: request.description,
        expires_at: request.closesAt,
        status: 'OPEN',
        prize_pool: 0,
        creator_bet_amount: 0,
        total_spots: 1000,
        spots_taken: 0,
      })
      .select()
      .single();

    if (createError || !market) {
      throw new Error('Failed to create market');
    }

    return market;
  },

  async getMarkets(): Promise<Event[]> {
    const { data: markets, error } = await supabase
      .from('events')
      .select('*, creator:users!events_creator_id_fkey(*)')
      .in('status', ['OPEN', 'RESOLVED'])
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch markets');
    }

    const marketsWithVolume = await Promise.all(
      (markets || []).map(async (market) => {
        const { data: bets } = await supabase
          .from('bets')
          .select('prediction, amount')
          .eq('event_id', market.id)
          .eq('status', 'ACTIVE');

        const yesVolume = (bets || [])
          .filter((b) => b.prediction === 'YES')
          .reduce((sum, b) => sum + Number(b.amount), 0);

        const noVolume = (bets || [])
          .filter((b) => b.prediction === 'NO')
          .reduce((sum, b) => sum + Number(b.amount), 0);

        return {
          ...market,
          yes_volume: yesVolume,
          no_volume: noVolume,
        };
      })
    );

    return marketsWithVolume;
  },

  async getMarket(marketId: string): Promise<Event & { bets: Bet[] }> {
    const { data: market, error: marketError } = await supabase
      .from('events')
      .select('*, creator:users!events_creator_id_fkey(*)')
      .eq('id', marketId)
      .single();

    if (marketError || !market) {
      throw new Error('Market not found');
    }

    const { data: bets, error: betsError } = await supabase
      .from('bets')
      .select('*, user:users!bets_user_id_fkey(*)')
      .eq('event_id', marketId)
      .order('created_at', { ascending: false });

    if (betsError) {
      throw new Error('Failed to fetch bets');
    }

    const yesVolume = (bets || [])
      .filter((b) => b.prediction === 'YES')
      .reduce((sum, b) => sum + Number(b.amount), 0);

    const noVolume = (bets || [])
      .filter((b) => b.prediction === 'NO')
      .reduce((sum, b) => sum + Number(b.amount), 0);

    return {
      ...market,
      yes_volume: yesVolume,
      no_volume: noVolume,
      bets: bets || [],
    };
  },

  async placeBet(request: PlaceBetRequest): Promise<Bet> {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('privy_id', request.privyUserId)
      .single();

    if (userError || !user) {
      throw new Error('User not found');
    }

    const { data: market, error: marketError } = await supabase
      .from('events')
      .select('*')
      .eq('id', request.marketId)
      .single();

    if (marketError || !market) {
      throw new Error('Market not found');
    }

    if (market.status !== 'OPEN') {
      throw new Error('Market is not open for betting');
    }

    if (market.expires_at && new Date(market.expires_at) < new Date()) {
      throw new Error('Market has expired');
    }

    const available = Number(user.balance_available || 0);
    if (available < request.stake) {
      throw new Error('Insufficient balance');
    }

    const newAvailable = available - request.stake;
    const newLocked = Number(user.balance_locked || 0) + request.stake;

    const { error: updateError } = await supabase
      .from('users')
      .update({
        balance_available: newAvailable,
        balance_locked: newLocked,
      })
      .eq('id', user.id);

    if (updateError) {
      throw new Error('Failed to update balance');
    }

    const newPrizePool = Number(market.prize_pool || 0) + request.stake;
    await supabase
      .from('events')
      .update({ prize_pool: newPrizePool })
      .eq('id', market.id);

    const { data: bet, error: betError } = await supabase
      .from('bets')
      .insert({
        user_id: user.id,
        event_id: request.marketId,
        amount: request.stake,
        prediction: request.side,
        status: 'ACTIVE',
      })
      .select()
      .single();

    if (betError || !bet) {
      throw new Error('Failed to place bet');
    }

    await supabase.from('ledger_entries').insert({
      user_id: user.id,
      kind: 'BET_PLACE',
      amount: request.stake,
      meta: {
        market_id: request.marketId,
        side: request.side,
        bet_id: bet.id,
      },
    });

    return bet;
  },

  async resolveMarket(request: ResolveMarketRequest): Promise<void> {
    const { data: market, error: marketError } = await supabase
      .from('events')
      .select('*')
      .eq('id', request.marketId)
      .single();

    if (marketError || !market) {
      throw new Error('Market not found');
    }

    if (market.status === 'RESOLVED') {
      throw new Error('Market already resolved');
    }

    const { data: bets, error: betsError } = await supabase
      .from('bets')
      .select('*')
      .eq('event_id', request.marketId)
      .eq('status', 'ACTIVE');

    if (betsError) {
      throw new Error('Failed to fetch bets');
    }

    const totalYes = (bets || [])
      .filter((b) => b.prediction === 'YES')
      .reduce((sum, b) => sum + Number(b.amount), 0);

    const totalNo = (bets || [])
      .filter((b) => b.prediction === 'NO')
      .reduce((sum, b) => sum + Number(b.amount), 0);

    const totalPool = Number(market.prize_pool || 0);
    const winningPool = request.winningSide === 'YES' ? totalYes : totalNo;

    if (winningPool === 0) {
      for (const bet of bets || []) {
        const { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('id', bet.user_id)
          .single();

        if (user) {
          await supabase
            .from('users')
            .update({
              balance_available: Number(user.balance_available) + Number(bet.amount),
              balance_locked: Number(user.balance_locked) - Number(bet.amount),
            })
            .eq('id', user.id);
        }

        await supabase
          .from('bets')
          .update({ status: 'REFUNDED' })
          .eq('id', bet.id);
      }
    } else {
      for (const bet of bets || []) {
        const { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('id', bet.user_id)
          .single();

        if (!user) continue;

        if (bet.prediction === request.winningSide) {
          const payout = (Number(bet.amount) / winningPool) * totalPool;

          await supabase
            .from('users')
            .update({
              balance_available: Number(user.balance_available) + payout,
              balance_locked: Number(user.balance_locked) - Number(bet.amount),
            })
            .eq('id', user.id);

          await supabase
            .from('bets')
            .update({ status: 'WON', payout })
            .eq('id', bet.id);

          await supabase.from('ledger_entries').insert({
            user_id: user.id,
            kind: 'BET_WIN',
            amount: payout,
            meta: {
              market_id: request.marketId,
              bet_id: bet.id,
              side: bet.prediction,
            },
          });
        } else {
          await supabase
            .from('users')
            .update({
              balance_locked: Number(user.balance_locked) - Number(bet.amount),
            })
            .eq('id', user.id);

          await supabase
            .from('bets')
            .update({ status: 'LOST' })
            .eq('id', bet.id);

          await supabase.from('ledger_entries').insert({
            user_id: user.id,
            kind: 'BET_LOSS',
            amount: Number(bet.amount),
            meta: {
              market_id: request.marketId,
              bet_id: bet.id,
              side: bet.prediction,
            },
          });
        }
      }
    }

    await supabase
      .from('events')
      .update({
        status: 'RESOLVED',
        winner_side: request.winningSide,
      })
      .eq('id', request.marketId);

    await supabase.from('market_resolutions').insert({
      market_id: request.marketId,
      winning_side: request.winningSide,
    });
  },
};
