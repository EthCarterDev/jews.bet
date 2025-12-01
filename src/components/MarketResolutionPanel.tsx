import { useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { Event } from '../types';

interface MarketResolutionPanelProps {
  market: Event;
  onResolved: () => void;
}

export function MarketResolutionPanel({ market, onResolved }: MarketResolutionPanelProps) {
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (market.status === 'RESOLVED') {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-500">
          <CheckCircle className="w-5 h-5" />
          <span className="font-semibold">
            Market Resolved - {market.winner_side} Wins
          </span>
        </div>
      </div>
    );
  }

  if (market.status !== 'OPEN') {
    return null;
  }

  const handleResolve = async (side: 'YES' | 'NO') => {
    if (!confirm(`Are you sure you want to resolve this market as ${side}? This cannot be undone.`)) {
      return;
    }

    setIsResolving(true);
    setError(null);

    try {
      await api.resolveMarket({
        marketId: market.id,
        winningSide: side,
      });
      onResolved();
    } catch (err: any) {
      console.error('Error resolving market:', err);
      setError(err.message || 'Failed to resolve market');
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
      <div className="mb-3">
        <h4 className="text-yellow-500 font-semibold text-sm mb-1">
          Admin / Dev Controls
        </h4>
        <p className="text-gray-400 text-xs">
          Resolve this market and distribute payouts to winners
        </p>
      </div>

      {error && (
        <div className="mb-3 bg-red-500/10 border border-red-500/50 rounded p-2 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => handleResolve('YES')}
          disabled={isResolving}
          className="flex-1 bg-green-600 hover:bg-green-500 text-white font-semibold py-2.5 px-4 rounded-lg
                   transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2"
        >
          {isResolving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          Resolve YES
        </button>
        <button
          onClick={() => handleResolve('NO')}
          disabled={isResolving}
          className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-2.5 px-4 rounded-lg
                   transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2"
        >
          {isResolving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          Resolve NO
        </button>
      </div>
    </div>
  );
}
