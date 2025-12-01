import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const MIN_DEPOSIT_SOL = 0.05;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const treasuryPublicKey = Deno.env.get('TREASURY_PUBLIC_KEY');

    if (!treasuryPublicKey ||
        treasuryPublicKey === 'YOUR_TREASURY_PUBLIC_KEY_HERE' ||
        treasuryPublicKey.includes('YOUR_') ||
        treasuryPublicKey.includes('REPLACE')) {
      return new Response(
        JSON.stringify({
          error: 'Treasury secrets are not configured. Please set TREASURY_PUBLIC_KEY in Supabase Edge Function secrets.'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { privyUserId, amount } = await req.json();

    if (!privyUserId || typeof amount !== 'number' || amount < MIN_DEPOSIT_SOL) {
      return new Response(
        JSON.stringify({ 
          error: `Invalid request. Amount must be at least ${MIN_DEPOSIT_SOL} SOL` 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, wallet_address')
      .eq('privy_id', privyUserId)
      .maybeSingle();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!user.wallet_address) {
      return new Response(
        JSON.stringify({ error: 'User wallet address not found' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: deposit, error: depositError } = await supabase
      .from('deposits')
      .insert({
        user_id: user.id,
        amount,
        from_address: user.wallet_address,
        status: 'PENDING',
      })
      .select()
      .single();

    if (depositError || !deposit) {
      console.error('Error creating deposit:', depositError);
      return new Response(
        JSON.stringify({ error: 'Failed to create deposit' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const memo = `DEP_${deposit.id}`;

    const { error: updateError } = await supabase
      .from('deposits')
      .update({ memo })
      .eq('id', deposit.id);

    if (updateError) {
      console.error('Error updating deposit memo:', updateError);
    }

    return new Response(
      JSON.stringify({
        depositId: deposit.id,
        treasuryAddress: treasuryPublicKey,
        memo,
        amount,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in init-deposit:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});