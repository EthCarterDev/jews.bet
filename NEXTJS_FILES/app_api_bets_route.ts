import { NextRequest, NextResponse } from 'next/server';
import { supabase, getUserByPrivyId, updateUserBalance, createLedgerEntry } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { privyUserId, marketId, side, stake } = body;

    if (!privyUserId || !marketId || !side || !stake || stake <= 0) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    const user = await getUserByPrivyId(privyUserId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { data: market, error: marketError } = await supabase
      .from('events')
      .select('*')
      .eq('id', marketId)
      .single();

    if (marketError || !market) {
      return NextResponse.json(
        { error: 'Market not found' },
        { status: 404 }
      );
    }

    if (market.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'Market is not open for betting' },
        { status: 400 }
      );
    }

    const now = new Date();
    const closesAt = new Date(market.expires_at);
    if (now > closesAt) {
      return NextResponse.json(
        { error: 'Market has closed' },
        { status: 400 }
      );
    }

    if (user.balance < stake) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    const newBalance = user.balance - stake;
    await updateUserBalance(user.id, newBalance);

    const { data: bet, error: betError } = await supabase
      .from('bets')
      .insert([
        {
          event_id: marketId,
          user_id: user.id,
          amount: stake,
          prediction: side,
          status: 'ACTIVE',
        },
      ])
      .select()
      .single();

    if (betError) throw betError;

    const newPrizePool = Number(market.prize_pool) + stake;
    const newSpotsTaken = market.spots_taken + 1;

    await supabase
      .from('events')
      .update({
        prize_pool: newPrizePool,
        spots_taken: newSpotsTaken,
      })
      .eq('id', marketId);

    await createLedgerEntry(user.id, 'BET_PLACE', stake, {
      marketId,
      side,
      betId: bet.id,
    });

    return NextResponse.json({ bet });
  } catch (error: any) {
    console.error('Error placing bet:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to place bet' },
      { status: 500 }
    );
  }
}
