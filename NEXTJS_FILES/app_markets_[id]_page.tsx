'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Market, Bet, MarketStats } from '@/lib/types';
import { usePrivy } from '@privy-io/react-auth';
import BetDialog from '@/components/BetDialog';
import { format } from 'date-fns';

export default function MarketDetailPage() {
  const params = useParams();
  const { user } = usePrivy();
  const [market, setMarket] = useState<Market | null>(null);
  const [bets, setBets] = useState<Bet[]>([]);
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBetDialog, setShowBetDialog] = useState(false);
  const [selectedSide, setSelectedSide] = useState<'YES' | 'NO' | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    fetchMarket();
  }, [params.id]);

  const fetchMarket = async () => {
    try {
      const response = await fetch(`/api/markets/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setMarket(data.market);
        setBets(data.bets);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching market:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBetClick = (side: 'YES' | 'NO') => {
    setSelectedSide(side);
    setShowBetDialog(true);
  };

  const handleResolve = async (winningSide: 'YES' | 'NO') => {
    if (!confirm(`Resolve market with ${winningSide} as winner?`)) return;

    setIsResolving(true);
    try {
      const response = await fetch(`/api/markets/${params.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winningSide }),
      });

      if (response.ok) {
        fetchMarket();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to resolve market');
      }
    } catch (error) {
      console.error('Error resolving market:', error);
      alert('Failed to resolve market');
    } finally {
      setIsResolving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="h-64 bg-[#0a0a0a] border border-gray-800 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  if (!market || !stats) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-gray-400">Market not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-8 mb-8">
        <h1 className="text-3xl font-bold mb-4">{market.title}</h1>

        {market.description && (
          <p className="text-gray-400 mb-6">{market.description}</p>
        )}

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#050608] rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Prize Pool</div>
            <div className="text-2xl font-bold text-[#d4af37]">
              {market.prize_pool.toFixed(2)} SOL
            </div>
          </div>
          <div className="bg-[#050608] rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">YES Volume</div>
            <div className="text-2xl font-bold text-green-500">
              {stats.yesVolume.toFixed(2)} SOL
            </div>
          </div>
          <div className="bg-[#050608] rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">NO Volume</div>
            <div className="text-2xl font-bold text-red-500">
              {stats.noVolume.toFixed(2)} SOL
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-400 mb-6">
          <span>Total Bets: {stats.totalBets}</span>
          <span>
            Closes: {format(new Date(market.closes_at), 'MMM d, yyyy HH:mm')}
          </span>
          <span className="px-3 py-1 bg-gray-800 rounded-full">
            {market.status}
          </span>
        </div>

        {market.status === 'OPEN' && user && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              onClick={() => handleBetClick('YES')}
              className="py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors text-lg"
            >
              Bet YES
            </button>
            <button
              onClick={() => handleBetClick('NO')}
              className="py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors text-lg"
            >
              Bet NO
            </button>
          </div>
        )}

        {market.status === 'OPEN' && user && (
          <div className="border-t border-gray-800 pt-4">
            <div className="text-sm text-gray-400 mb-2">Admin: Resolve Market</div>
            <div className="flex gap-3">
              <button
                onClick={() => handleResolve('YES')}
                disabled={isResolving}
                className="flex-1 py-2 bg-green-900 hover:bg-green-800 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Resolve YES
              </button>
              <button
                onClick={() => handleResolve('NO')}
                disabled={isResolving}
                className="flex-1 py-2 bg-red-900 hover:bg-red-800 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Resolve NO
              </button>
            </div>
          </div>
        )}

        {market.status === 'RESOLVED' && market.winner_side && (
          <div className="text-center py-4 bg-[#d4af37] text-black font-bold rounded-lg text-xl">
            Resolved: {market.winner_side} Won
          </div>
        )}
      </div>

      <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-6">All Bets ({bets.length})</h2>

        {bets.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No bets placed yet</p>
        ) : (
          <div className="space-y-3">
            {bets.map((bet) => (
              <div
                key={bet.id}
                className="bg-[#050608] rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-lg font-bold ${
                      bet.prediction === 'YES'
                        ? 'bg-green-900 text-green-300'
                        : 'bg-red-900 text-red-300'
                    }`}
                  >
                    {bet.prediction}
                  </span>
                  <div>
                    <div className="text-white font-medium">
                      {bet.user?.username || 'Anonymous'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(bet.created_at), 'MMM d, HH:mm')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[#d4af37] font-bold">
                    {Number(bet.amount).toFixed(4)} SOL
                  </div>
                  <div className="text-xs text-gray-500">{bet.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showBetDialog && selectedSide && (
        <BetDialog
          market={market}
          side={selectedSide}
          onClose={() => setShowBetDialog(false)}
          onSuccess={() => {
            setShowBetDialog(false);
            fetchMarket();
          }}
        />
      )}
    </div>
  );
}
