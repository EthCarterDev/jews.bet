import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const TREASURY_PUBLIC_KEY = process.env.TREASURY_PUBLIC_KEY;

export function getConnection(): Connection {
  return new Connection(SOLANA_RPC_URL, 'confirmed');
}

export function getTreasuryPublicKey(): PublicKey | null {
  if (!TREASURY_PUBLIC_KEY) {
    console.warn('TREASURY_PUBLIC_KEY not set');
    return null;
  }
  return new PublicKey(TREASURY_PUBLIC_KEY);
}

export async function getWalletBalance(walletAddress: string): Promise<number> {
  try {
    const connection = getConnection();
    const publicKey = new PublicKey(walletAddress);
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return 0;
  }
}

export async function depositToApp(
  userWalletAddress: string,
  amount: number
): Promise<string> {
  throw new Error('TODO: Implement real Solana deposit transaction');
}

export async function withdrawFromApp(
  userWalletAddress: string,
  amount: number
): Promise<string> {
  throw new Error('TODO: Implement real Solana withdrawal transaction');
}
