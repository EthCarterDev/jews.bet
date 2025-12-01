import { createClient } from 'npm:@supabase/supabase-js@2';
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} from 'npm:@solana/web3.js@1';
import * as bs58 from 'npm:bs58@5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const MIN_WITHDRAWAL_SOL = 0.05;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const solanaRpcUrl = Deno.env.get('SOLANA_RPC_URL');
    const treasuryPrivateKey = Deno.env.get('TREASURY_PRIVATE_KEY');

    if (!solanaRpcUrl) {
      return new Response(
        JSON.stringify({
          error: 'Solana RPC URL is not configured. Please set SOLANA_RPC_URL in Supabase Edge Function secrets.'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!treasuryPrivateKey ||
        treasuryPrivateKey.includes('YOUR_') ||
        treasuryPrivateKey.includes('REPLACE')) {
      return new Response(
        JSON.stringify({
          error: 'Treasury secrets are not configured. Please set TREASURY_PRIVATE_KEY in Supabase Edge Function secrets.'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const supabaseClient = createClient(supabaseUrl, supabaseKey.replace('service_role', 'anon'), {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser();
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

    if (!privyUserId || typeof amount !== 'number' || amount < MIN_WITHDRAWAL_SOL) {
      return new Response(
        JSON.stringify({
          error: `Invalid request. Amount must be at least ${MIN_WITHDRAWAL_SOL} SOL`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, wallet_address, balance_available')
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

    if (user.balance_available < amount) {
      return new Response(
        JSON.stringify({
          error: `Insufficient balance. Available: ${user.balance_available} SOL`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const newAvailable = user.balance_available - amount;

    const { error: updateUserError } = await supabase
      .from('users')
      .update({ balance_available: newAvailable })
      .eq('id', user.id);

    if (updateUserError) {
      console.error('Error updating user balance:', updateUserError);
      return new Response(
        JSON.stringify({ error: 'Failed to update balance' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let txSignature: string;
    try {
      const connection = new Connection(solanaRpcUrl, 'confirmed');

      const treasuryKeypair = Keypair.fromSecretKey(bs58.decode(treasuryPrivateKey));
      const toPublicKey = new PublicKey(user.wallet_address);

      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: treasuryKeypair.publicKey,
          toPubkey: toPublicKey,
          lamports,
        })
      );

      txSignature = await sendAndConfirmTransaction(connection, transaction, [treasuryKeypair], {
        commitment: 'confirmed',
      });
    } catch (error) {
      console.error('Error sending withdrawal transaction:', error);

      await supabase
        .from('users')
        .update({ balance_available: user.balance_available })
        .eq('id', user.id);

      return new Response(
        JSON.stringify({ error: 'Failed to send transaction' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    await supabase.from('ledger_entries').insert({
      user_id: user.id,
      kind: 'WITHDRAWAL',
      amount,
      meta: {
        txSignature,
        toAddress: user.wallet_address,
      },
    });

    const { data: updatedUser } = await supabase
      .from('users')
      .select('balance_available, balance_locked')
      .eq('id', user.id)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        txSignature,
        amount,
        balance: updatedUser,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in withdraw:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});