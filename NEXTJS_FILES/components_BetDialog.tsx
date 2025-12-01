'use client';

import { Market } from '@/lib/types';
import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';

interface BetDialogProps {
  market: Market;
  side: 'YES' | 'NO';
  onClose: () => void;
  onSuccess: () => void;
}

export default function BetDialog({ market, side, onClose, onSuccess }: BetDialogProps) {
  const { user } = usePrivy();
  const [stake, setStake] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) return;

    const stakeAmount = parseFloat(stake);
    if (isNaN(stakeAmount) || stakeAmount <= 0) {
      setError('Invalid stake amount');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          privyUserId: user.id,
          marketId: market.id,
          side,
          stake: stakeAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place bet');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to place bet');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0a0a0a] border-2 border-gray-800 rounded-xl w-full max-w-md p-6">
        <h2 className="text-2xl font-bold text-white mb-4">
          Place Bet: {side}
        </h2>

        <div className="bg-[#050608] rounded-lg p-4 mb-4">
          <p className="text-white text-sm mb-2">{market.title}</p>
          <div className="text-xs text-gray-400">
            Prize Pool: {market.prize_pool.toFixed(2)} SOL
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Stake Amount (SOL)
            </label>
            <input
              type="number"
              step="0.01"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              className="w-full bg-[#050608] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-[#d4af37] focus:outline-none"
              placeholder="0.1"
              required
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-900 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-[#d4af37] hover:bg-[#c49d2d] text-black font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Placing...' : 'Place Bet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
