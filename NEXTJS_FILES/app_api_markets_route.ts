import { NextRequest, NextResponse } from 'next/server';
import { supabase, getUserByPrivyId } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'OPEN')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const marketsWithStats = await Promise.all(
      (events || []).map(async (event) => {
        const { data: bets } = await supabase
          .from('bets')
          .select('amount, prediction')
          .eq('event_id', event.id);

        const yesVolume = (bets || [])
          .filter((b) => b.prediction === 'YES')
          .reduce((sum, b) => sum + Number(b.amount), 0);

        const noVolume = (bets || [])
          .filter((b) => b.prediction === 'NO')
          .reduce((sum, b) => sum + Number(b.amount), 0);

        return {
          market: {
            ...event,
            closes_at: event.expires_at,
          },
          stats: {
            yesVolume,
            noVolume,
            totalBets: bets?.length || 0,
          },
        };
      })
    );

    return NextResponse.json({ markets: marketsWithStats });
  } catch (error: any) {
    console.error('Error fetching markets:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch markets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { privyUserId, question, description, closesAt } = body;

    if (!privyUserId || !question || !closesAt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    const { data: market, error } = await supabase
      .from('events')
      .insert([
        {
          creator_id: user.id,
          title: question,
          description,
          creator_bet_amount: 0,
          total_spots: 999,
          spots_taken: 0,
          prize_pool: 0,
          status: 'OPEN',
          expires_at: closesAt,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ market });
  } catch (error: any) {
    console.error('Error creating market:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create market' },
      { status: 500 }
    );
  }
}
