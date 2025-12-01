import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { usePrivy, useSolanaWallets } from '@privy-io/react-auth';
import { buildDepositTransaction, MIN_DEPOSIT_SOL } from '../lib/solana';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const { user: privyUser } = usePrivy();
  const { wallets } = useSolanaWallets();
  const { user, refreshUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDeposit = async () => {
    if (!privyUser?.id || !user) {
      setError('Please log in to deposit');
      return;
    }

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount < MIN_DEPOSIT_SOL) {
      setError(`Minimum deposit is ${MIN_DEPOSIT_SOL} SOL`);
      return;
    }

    console.log('[DEBUG DepositModal] Available wallets:', wallets);
    const wallet = wallets.find((w) => w.walletClientType === 'privy');
    if (!wallet) {
      console.error('[DEBUG DepositModal] No Solana wallet found! Wallets:', wallets);
      setError('No Solana wallet found. Please check Privy configuration for Solana embedded wallets.');
      return;
    }
    console.log('[DEBUG DepositModal] Using wallet:', wallet.address);

    setIsProcessing(true);
    setError('');
    setSuccess(false);

    try {
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        throw new Error('Not authenticated');
      }

      const initResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/init-deposit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authData.session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            privyUserId: privyUser.id,
            amount: depositAmount,
          }),
        }
      );

      if (!initResponse.ok) {
        const errorData = await initResponse.json();
        throw new Error(errorData.error || 'Failed to initialize deposit');
      }

      const { depositId, memo } = await initResponse.json();

      const transaction = await buildDepositTransaction(
        wallet.address,
        depositAmount,
        memo
      );

      const provider = await wallet.getProvider();

      const signedTransaction = await provider.signTransaction(transaction);

      const txSignature = await provider.sendTransaction(signedTransaction);

      const confirmResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/confirm-deposit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authData.session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            depositId,
            txSignature,
          }),
        }
      );

      if (!confirmResponse.ok) {
        const errorData = await confirmResponse.json();
        throw new Error(errorData.error || 'Failed to confirm deposit');
      }

      await refreshUser();
      setSuccess(true);
      setAmount('');
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      console.error('Deposit error:', err);
      setError(err.message || 'Failed to process deposit');
    } finally {
      setIsProcessing(false);
    }
  };

  const quickAmounts = [0.1, 0.5, 1, 5];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Deposit SOL</h2>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Deposit Confirmed!</h3>
              <p className="text-gray-400">Your balance has been updated</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Amount (SOL)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Min: ${MIN_DEPOSIT_SOL} SOL`}
                  step="0.01"
                  min={MIN_DEPOSIT_SOL}
                  disabled={isProcessing}
                  className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#9945FF] disabled:opacity-50"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Quick amounts
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt.toString())}
                      disabled={isProcessing}
                      className="py-2 bg-[#0a0a0a] hover:bg-gray-900 border border-gray-800 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="bg-[#0a0a0a] rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-400">
                  You will be asked to sign a transaction to deposit SOL from your wallet to the
                  platform treasury. This transaction will be processed on{' '}
                  <span className="text-white font-semibold">Solana mainnet</span>.
                </p>
              </div>

              <button
                onClick={handleDeposit}
                disabled={isProcessing || !amount || parseFloat(amount) < MIN_DEPOSIT_SOL}
                className="w-full py-3 bg-[#9945FF] hover:bg-[#7d3ad4] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Deposit'
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
