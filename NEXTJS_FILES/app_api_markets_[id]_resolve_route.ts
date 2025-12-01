import { NextRequest, NextResponse } from 'next/server';
import { supabase, updateUserBalance, createLedgerEntry } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { winningSide } = body;

    if (!winningSide || (winningSide !== 'YES' && winningSide !== 'NO')) {
      return NextResponse.json(
        { error: 'Invalid winningSide' },
        { status: 400 }
      );
    }

    const { data: market, error: marketError } = await supabase
      .from('events')
      .select('*')
      .eq('id', params.id)
      .single();

    if (marketError || !market) {
      return NextResponse.json(
        { error: 'Market not found' },
        { status: 404 }
      );
    }

    if (market.status === 'RESOLVED') {
      return NextResponse.json(
        { error: 'Market already resolved' },
        { status: 400 }
      );
    }

    const { data: bets, error: betsError } = await supabase
      .from('bets')
      .select('*, user:users(*)')
      .eq('event_id', params.id);

    if (betsError) throw betsError;

    const totalWinningStake = (bets || [])
      .filter((b) => b.prediction === winningSide && b.status === 'ACTIVE')
      .reduce((sum, b) => sum + Number(b.amount), 0);

    const prizePool = Number(market.prize_pool);

    if (totalWinningStake === 0) {
      for (const bet of bets || []) {
        if (bet.status !== 'ACTIVE') continue;

        const user = bet.user;
        const newBalance = Number(user.balance) + Number(bet.amount);
        await updateUserBalance(user.id, newBalance);

        await supabase
          .from('bets')
          .update({ status: 'REFUNDED' })
          .eq('id', bet.id);

        await createLedgerEntry(user.id, 'BET_WIN', Number(bet.amount), {
          marketId: params.id,
          betId: bet.id,
          outcome: 'refund',
        });
      }
    } else {
      for (const bet of bets || []) {
        if (bet.status !== 'ACTIVE') continue;

        const user = bet.user;

        if (bet.prediction === winningSide) {
          const betAmount = Number(bet.amount);
          const payout = (betAmount / totalWinningStake) * prizePool;
          const newBalance = Number(user.balance) + payout;

          await updateUserBalance(user.id, newBalance);

          await supabase
            .from('bets')
            .update({ status: 'WON' })
            .eq('id', bet.id);

          await createLedgerEntry(user.id, 'BET_WIN', payout, {
            marketId: params.id,
            betId: bet.id,
            winningSide,
            originalStake: betAmount,
          });
        } else {
          await supabase
            .from('bets')
            .update({ status: 'LOST' })
            .eq('id', bet.id);

          await createLedgerEntry(user.id, 'BET_LOSS', Number(bet.amount), {
            marketId: params.id,
            betId: bet.id,
            winningSide,
          });
        }
      }
    }

    await supabase
      .from('events')
      .update({
        status: 'RESOLVED',
        winner_side: winningSide,
        result: winningSide,
      })
      .eq('id', params.id);

    return NextResponse.json({
      success: true,
      message: `Market resolved with ${winningSide} as winner`,
    });
  } catch (error: any) {
    console.error('Error resolving market:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to resolve market' },
      { status: 500 }
    );
  }
}
