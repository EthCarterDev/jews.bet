import { createClient } from 'npm:@supabase/supabase-js@2';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from 'npm:@solana/web3.js@1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const MEMO_PROGRAM_ID = 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr';

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
    const treasuryPublicKey = Deno.env.get('TREASURY_PUBLIC_KEY');

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

    if (!treasuryPublicKey ||
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

    const { depositId, txSignature } = await req.json();

    if (!depositId || !txSignature) {
      return new Response(
        JSON.stringify({ error: 'Missing depositId or txSignature' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: deposit, error: depositError } = await supabase
      .from('deposits')
      .select('*, users!inner(id, privy_id, balance_available, balance_locked)')
      .eq('id', depositId)
      .maybeSingle();

    if (depositError || !deposit) {
      return new Response(
        JSON.stringify({ error: 'Deposit not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (deposit.status !== 'PENDING') {
      return new Response(
        JSON.stringify({ error: 'Deposit already processed' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const connection = new Connection(solanaRpcUrl, 'confirmed');

    let transaction;
    try {
      transaction = await connection.getTransaction(txSignature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      });
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch transaction from blockchain' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!transaction) {
      return new Response(
        JSON.stringify({ error: 'Transaction not found on blockchain' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (transaction.meta?.err) {
      await supabase
        .from('deposits')
        .update({ status: 'FAILED' })
        .eq('id', depositId);

      return new Response(
        JSON.stringify({ error: 'Transaction failed on blockchain' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const fromPubkey = new PublicKey(deposit.from_address);
    const toPubkey = new PublicKey(treasuryPublicKey);

    let transferAmount = 0;
    const preBalances = transaction.meta?.preBalances || [];
    const postBalances = transaction.meta?.postBalances || [];
    const accountKeys = transaction.transaction.message.getAccountKeys();

    const fromIndex = accountKeys.staticAccountKeys.findIndex((key) =>
      key.equals(fromPubkey)
    );
    const toIndex = accountKeys.staticAccountKeys.findIndex((key) =>
      key.equals(toPubkey)
    );

    if (fromIndex >= 0 && toIndex >= 0) {
      const fromBalanceChange = preBalances[fromIndex] - postBalances[fromIndex];
      const toBalanceChange = postBalances[toIndex] - preBalances[toIndex];
      transferAmount = toBalanceChange;

      if (transferAmount <= 0) {
        await supabase
          .from('deposits')
          .update({ status: 'FAILED' })
          .eq('id', depositId);

        return new Response(
          JSON.stringify({ error: 'No transfer detected in transaction' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    } else {
      await supabase
        .from('deposits')
        .update({ status: 'FAILED' })
        .eq('id', depositId);

      return new Response(
        JSON.stringify({ error: 'Invalid transaction: accounts not found' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const transferSol = transferAmount / LAMPORTS_PER_SOL;
    const tolerance = 0.001;
    if (Math.abs(transferSol - deposit.amount) > tolerance) {
      await supabase
        .from('deposits')
        .update({ status: 'FAILED' })
        .eq('id', depositId);

      return new Response(
        JSON.stringify({
          error: `Amount mismatch: expected ${deposit.amount} SOL, got ${transferSol} SOL`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let memoFound = false;
    if (deposit.memo && transaction.transaction.message.instructions) {
      for (const instruction of transaction.transaction.message.instructions) {
        const programId = accountKeys.staticAccountKeys[instruction.programIdIndex];
        if (programId.toString() === MEMO_PROGRAM_ID) {
          const memoData = Buffer.from(instruction.data).toString('utf-8');
          if (memoData === deposit.memo) {
            memoFound = true;
            break;
          }
        }
      }
    }

    if (deposit.memo && !memoFound) {
      await supabase
        .from('deposits')
        .update({ status: 'FAILED' })
        .eq('id', depositId);

      return new Response(
        JSON.stringify({ error: 'Memo mismatch or not found in transaction' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const user = deposit.users;
    const newAvailable = (user.balance_available || 0) + deposit.amount;

    const { error: updateUserError } = await supabase
      .from('users')
      .update({ balance_available: newAvailable })
      .eq('id', deposit.user_id);

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

    const { error: updateDepositError } = await supabase
      .from('deposits')
      .update({
        status: 'CONFIRMED',
        tx_signature: txSignature,
      })
      .eq('id', depositId);

    if (updateDepositError) {
      console.error('Error updating deposit:', updateDepositError);
    }

    await supabase.from('ledger_entries').insert({
      user_id: deposit.user_id,
      kind: 'DEPOSIT',
      amount: deposit.amount,
      meta: {
        depositId,
        txSignature,
      },
    });

    const { data: updatedUser } = await supabase
      .from('users')
      .select('balance_available, balance_locked')
      .eq('id', deposit.user_id)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        deposit: {
          id: depositId,
          amount: deposit.amount,
          status: 'CONFIRMED',
          txSignature,
        },
        balance: updatedUser,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in confirm-deposit:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});