import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: market, error: marketError } = await supabase
      .from('events')
      .select('*, creator:users(*)')
      .eq('id', params.id)
      .single();

    if (marketError || !market) {
      return NextResponse.json(
        { error: 'Market not found' },
        { status: 404 }
      );
    }

    const { data: bets, error: betsError } = await supabase
      .from('bets')
      .select('*, user:users(*)')
      .eq('event_id', params.id)
      .order('created_at', { ascending: false });

    if (betsError) throw betsError;

    const yesVolume = (bets || [])
      .filter((b) => b.prediction === 'YES')
      .reduce((sum, b) => sum + Number(b.amount), 0);

    const noVolume = (bets || [])
      .filter((b) => b.prediction === 'NO')
      .reduce((sum, b) => sum + Number(b.amount), 0);

    return NextResponse.json({
      market: {
        ...market,
        closes_at: market.expires_at,
      },
      bets: bets || [],
      stats: {
        yesVolume,
        noVolume,
        totalBets: bets?.length || 0,
      },
    });
  } catch (error: any) {
    console.error('Error fetching market:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch market' },
      { status: 500 }
    );
  }
}
