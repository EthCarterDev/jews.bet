import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getOrCreateUser(privyUserId: string, email: string | null, walletAddress: string | null) {
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('privy_id', privyUserId)
    .maybeSingle();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw fetchError;
  }

  if (existingUser) {
    return existingUser;
  }

  const username = email?.split('@')[0] || `user_${privyUserId.slice(0, 8)}`;

  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert([
      {
        privy_id: privyUserId,
        email,
        wallet_address: walletAddress,
        balance: 0,
        username,
      },
    ])
    .select()
    .single();

  if (insertError) {
    throw insertError;
  }

  return newUser;
}

export async function getUserByPrivyId(privyUserId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('privy_id', privyUserId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateUserBalance(userId: string, amount: number) {
  const { data, error } = await supabase
    .from('users')
    .update({ balance: amount })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createLedgerEntry(
  userId: string | null,
  kind: string,
  amount: number,
  meta?: Record<string, any>
) {
  const { data, error } = await supabase
    .from('ledger_entries')
    .insert([
      {
        user_id: userId,
        kind,
        amount,
        meta,
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
