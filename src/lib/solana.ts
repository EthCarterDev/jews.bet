import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
} from '@solana/web3.js';

export const MIN_DEPOSIT_SOL = 0.05;
export const MIN_WITHDRAWAL_SOL = 0.05;

export function createConnection(): Connection {
  const rpcUrl = 'https://api.mainnet-beta.solana.com';
  return new Connection(rpcUrl, 'confirmed');
}

export function getTreasuryPublicKey(): PublicKey {
  const treasuryKey = import.meta.env.VITE_TREASURY_PUBLIC_KEY;
  if (!treasuryKey ||
      treasuryKey === 'YOUR_TREASURY_PUBLIC_KEY_HERE' ||
      treasuryKey.includes('YOUR_') ||
      treasuryKey.includes('REPLACE')) {
    throw new Error('Treasury public key not configured. Please set VITE_TREASURY_PUBLIC_KEY in .env file.');
  }
  return new PublicKey(treasuryKey);
}

export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

export function solToLamports(sol: number): number {
  return Math.floor(sol * LAMPORTS_PER_SOL);
}

export function createMemoInstruction(memo: string, signers: PublicKey[]): TransactionInstruction {
  const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

  return new TransactionInstruction({
    keys: signers.map(signer => ({ pubkey: signer, isSigner: true, isWritable: false })),
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(memo, 'utf-8'),
  });
}

export async function buildDepositTransaction(
  fromAddress: string,
  amount: number,
  memo: string
): Promise<Transaction> {
  const connection = createConnection();
  const fromPubkey = new PublicKey(fromAddress);
  const toPubkey = getTreasuryPublicKey();
  const lamports = solToLamports(amount);

  const transaction = new Transaction();

  const transferInstruction = SystemProgram.transfer({
    fromPubkey,
    toPubkey,
    lamports,
  });

  transaction.add(transferInstruction);

  const memoInstruction = createMemoInstruction(memo, [fromPubkey]);
  transaction.add(memoInstruction);

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;
  transaction.feePayer = fromPubkey;

  return transaction;
}

export function formatSolAddress(address: string, chars: number = 4): string {
  if (!address || address.length < chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function validateSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}
