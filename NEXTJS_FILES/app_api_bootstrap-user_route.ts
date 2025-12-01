import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { privyUserId, email, walletAddress } = body;

    if (!privyUserId) {
      return NextResponse.json(
        { error: 'privyUserId is required' },
        { status: 400 }
      );
    }

    const user = await getOrCreateUser(privyUserId, email, walletAddress);

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('Error in bootstrap-user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to bootstrap user' },
      { status: 500 }
    );
  }
}
