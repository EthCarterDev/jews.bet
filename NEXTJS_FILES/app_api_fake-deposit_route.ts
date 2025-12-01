import { NextRequest, NextResponse } from 'next/server';
import { supabase, getUserByPrivyId, updateUserBalance, createLedgerEntry } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { privyUserId, amount } = body;

    if (!privyUserId || !amount || amount <= 0) {
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

    const newBalance = user.balance + amount;
    const updatedUser = await updateUserBalance(user.id, newBalance);

    await createLedgerEntry(user.id, 'DEPOSIT', amount, {
      method: 'fake',
      note: 'Development test deposit',
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error: any) {
    console.error('Error in fake-deposit:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to deposit' },
      { status: 500 }
    );
  }
}
