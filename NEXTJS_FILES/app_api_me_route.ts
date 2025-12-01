import { NextRequest, NextResponse } from 'next/server';
import { getUserByPrivyId } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const privyUserId = request.headers.get('x-privy-user-id');

    if (!privyUserId) {
      return NextResponse.json(
        { error: 'x-privy-user-id header is required' },
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

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('Error in /api/me:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
