import { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Event } from '../types';

interface BetModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: (Event & { _preBetSide?: 'YES' | 'NO' }) | null;
  onBetPlaced: () => void;
}

export function BetModal({ isOpen, onClose, event, onBetPlaced }: BetModalProps) {
  const { user, refreshUser } = useAuth();
  const [betAmount, setBetAmount] = useState('');
  const [prediction, setPrediction] = useState<'YES' | 'NO' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (event?._preBetSide) {
      setPrediction(event._preBetSide);
    }
  }, [event]);

  if (!isOpen || !event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !prediction) return;

    const amount = parseFloat(betAmount);

    if (isNaN(amount) || amount <= 0) {
      setError('Invalid bet amount');
      return;
    }

    if (amount > Number(user.balance_available || 0)) {
      setError('Insufficient available balance');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.placeBet({
        privyUserId: user.privy_id,
        marketId: event.id,
        side: prediction,
        stake: amount,
      });

      await refreshUser();
      setBetAmount('');
      setPrediction(null);
      onBetPlaced();
      onClose();
    } catch (err: any) {
      console.error('Error placing bet:', err);
      setError(err.message || 'Failed to place bet');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-xl border-2 border-gray-800 w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Place Bet</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-[#0a0a0a] rounded-lg p-4 mb-6">
            <p className="text-white text-sm mb-2">{event.title}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Prize Pool:</span>
              <span className="text-[#FFD700] font-bold">
                {event.prize_pool.toFixed(4)} SOL
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
              <span>Spots: {event.spots_taken}/{event.total_spots}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Your Prediction
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPrediction('YES')}
                  className={`py-3 rounded-lg font-bold transition-all ${
                    prediction === 'YES'
                      ? 'bg-green-500 text-white'
                      : 'bg-[#0a0a0a] text-gray-400 hover:bg-[#151515] border border-gray-800'
                  }`}
                >
                  YES
                </button>
                <button
                  type="button"
                  onClick={() => setPrediction('NO')}
                  className={`py-3 rounded-lg font-bold transition-all ${
                    prediction === 'NO'
                      ? 'bg-red-500 text-white'
                      : 'bg-[#0a0a0a] text-gray-400 hover:bg-[#151515] border border-gray-800'
                  }`}
                >
                  NO
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Bet Amount (SOL)
              </label>
              <input
                type="number"
                step="0.001"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none"
                placeholder="0.1"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Available: {Number(user?.balance_available || 0).toFixed(4)} SOL
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-[#0a0a0a] hover:bg-[#151515] text-white py-3 rounded-lg font-medium transition-colors border border-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !prediction}
                className="flex-1 bg-[#FFD700] hover:bg-[#FFC700] text-black py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Placing...' : 'Place Bet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
