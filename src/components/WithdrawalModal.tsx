import { useState } from 'react';
import { X, Loader2, ExternalLink } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { MIN_WITHDRAWAL_SOL } from '../lib/solana';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WithdrawalModal({ isOpen, onClose }: WithdrawalModalProps) {
  const { user: privyUser } = usePrivy();
  const { user, refreshUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [txSignature, setTxSignature] = useState('');

  if (!isOpen) return null;

  const handleWithdraw = async () => {
    if (!privyUser?.id || !user) {
      setError('Please log in to withdraw');
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount < MIN_WITHDRAWAL_SOL) {
      setError(`Minimum withdrawal is ${MIN_WITHDRAWAL_SOL} SOL`);
      return;
    }

    if (withdrawAmount > (user.balance_available || 0)) {
      setError('Insufficient balance');
      return;
    }

    setIsProcessing(true);
    setError('');
    setTxSignature('');

    try {
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/withdraw`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authData.session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            privyUserId: privyUser.id,
            amount: withdrawAmount,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process withdrawal');
      }

      const result = await response.json();
      setTxSignature(result.txSignature);
      await refreshUser();
      setAmount('');

      setTimeout(() => {
        onClose();
        setTxSignature('');
      }, 5000);
    } catch (err: any) {
      console.error('Withdrawal error:', err);
      setError(err.message || 'Failed to process withdrawal');
    } finally {
      setIsProcessing(false);
    }
  };

  const maxAmount = user?.balance_available || 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Withdraw SOL</h2>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {txSignature ? (
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
              <h3 className="text-xl font-bold text-white mb-2">Withdrawal Sent!</h3>
              <p className="text-gray-400 mb-4">SOL sent to your wallet</p>
              <a
                href={`https://solscan.io/tx/${txSignature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#9945FF] hover:text-[#7d3ad4] transition-colors"
              >
                View on Solscan
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-400">Available balance</span>
                  <span className="text-white font-mono">
                    {maxAmount.toFixed(4)} SOL
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Amount (SOL)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Min: ${MIN_WITHDRAWAL_SOL} SOL`}
                    step="0.01"
                    min={MIN_WITHDRAWAL_SOL}
                    max={maxAmount}
                    disabled={isProcessing}
                    className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#9945FF] disabled:opacity-50"
                  />
                  <button
                    onClick={() => setAmount(maxAmount.toString())}
                    disabled={isProcessing}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#9945FF] hover:text-[#7d3ad4] transition-colors disabled:opacity-50"
                  >
                    MAX
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="bg-[#0a0a0a] rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-400">
                  SOL will be sent directly to your wallet on{' '}
                  <span className="text-white font-semibold">Solana mainnet</span>. The transaction
                  will be processed immediately.
                </p>
              </div>

              <button
                onClick={handleWithdraw}
                disabled={
                  isProcessing ||
                  !amount ||
                  parseFloat(amount) < MIN_WITHDRAWAL_SOL ||
                  parseFloat(amount) > maxAmount
                }
                className="w-full py-3 bg-[#9945FF] hover:bg-[#7d3ad4] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Withdraw'
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
