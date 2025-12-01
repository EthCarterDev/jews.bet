'use client';

import { Market, MarketStats } from '@/lib/types';
import Link from 'next/link';
import { useState } from 'react';
import BetDialog from './BetDialog';

interface MarketCardProps {
  market: Market;
  stats: MarketStats;
  onBetPlaced?: () => void;
}

export default function MarketCard({ market, stats, onBetPlaced }: MarketCardProps) {
  const [showBetDialog, setShowBetDialog] = useState(false);
  const [selectedSide, setSelectedSide] = useState<'YES' | 'NO' | null>(null);

  const handleBetClick = (side: 'YES' | 'NO') => {
    setSelectedSide(side);
    setShowBetDialog(true);
  };

  const handleBetSuccess = () => {
    setShowBetDialog(false);
    if (onBetPlaced) {
      onBetPlaced();
    }
  };

  return (
    <>
      <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
        <Link href={`/markets/${market.id}`}>
          <h3 className="text-xl font-bold text-white mb-3 hover:text-[#d4af37] transition-colors">
            {market.title}
          </h3>
        </Link>

        {market.description && (
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {market.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-[#050608] rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">YES Volume</div>
            <div className="text-lg font-bold text-green-500">
              {stats.yesVolume.toFixed(2)} SOL
            </div>
          </div>
          <div className="bg-[#050608] rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">NO Volume</div>
            <div className="text-lg font-bold text-red-500">
              {stats.noVolume.toFixed(2)} SOL
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
          <span>Prize Pool: {market.prize_pool.toFixed(2)} SOL</span>
          <span>Total Bets: {stats.totalBets}</span>
        </div>

        {market.status === 'OPEN' && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleBetClick('YES')}
              className="py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
            >
              Bet YES
            </button>
            <button
              onClick={() => handleBetClick('NO')}
              className="py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
            >
              Bet NO
            </button>
          </div>
        )}

        {market.status === 'RESOLVED' && market.winner_side && (
          <div className="text-center py-3 bg-[#d4af37] text-black font-bold rounded-lg">
            Resolved: {market.winner_side} Won
          </div>
        )}
      </div>

      {showBetDialog && selectedSide && (
        <BetDialog
          market={market}
          side={selectedSide}
          onClose={() => setShowBetDialog(false)}
          onSuccess={handleBetSuccess}
        />
      )}
    </>
  );
}
