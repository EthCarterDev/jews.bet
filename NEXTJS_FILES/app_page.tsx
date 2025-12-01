'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { Market, MarketStats } from '@/lib/types';
import MarketCard from '@/components/MarketCard';

export default function HomePage() {
  const { ready, authenticated } = usePrivy();
  const [markets, setMarkets] = useState<Array<{ market: Market; stats: MarketStats }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (ready) {
      fetchMarkets();
    }
  }, [ready]);

  const fetchMarkets = async () => {
    try {
      const response = await fetch('/api/markets');
      if (response.ok) {
        const data = await response.json();
        setMarkets(data.markets);
      }
    } catch (error) {
      console.error('Error fetching markets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-xl text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <h1 className="text-6xl font-bold mb-6">
          <span className="text-[#d4af37]">Jews</span>
          <span className="text-white">.bet</span>
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Decentralized prediction markets on Solana
        </p>
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-4">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div>
              <div className="text-[#d4af37] text-3xl font-bold mb-2">1</div>
              <h3 className="font-bold mb-2">Login with Privy</h3>
              <p className="text-sm text-gray-400">
                Connect with email, Twitter, or wallet. Get an embedded Solana wallet automatically.
              </p>
            </div>
            <div>
              <div className="text-[#d4af37] text-3xl font-bold mb-2">2</div>
              <h3 className="font-bold mb-2">Create or bet on markets</h3>
              <p className="text-sm text-gray-400">
                Place bets on YES/NO prediction markets. All balances are off-chain for instant trading.
              </p>
            </div>
            <div>
              <div className="text-[#d4af37] text-3xl font-bold mb-2">3</div>
              <h3 className="font-bold mb-2">Win and withdraw</h3>
              <p className="text-sm text-gray-400">
                Winners split the prize pool proportionally. Withdraw your SOL anytime.
              </p>
            </div>
          </div>
        </div>
        <p className="text-gray-500">Login to start trading</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Open Markets</h1>
        <p className="text-gray-400">
          Place your bets on prediction markets
        </p>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 bg-[#0a0a0a] border border-gray-800 rounded-xl animate-pulse"
            ></div>
          ))}
        </div>
      ) : markets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">No markets available yet</p>
          <a
            href="/markets/new"
            className="inline-block px-6 py-3 bg-[#d4af37] hover:bg-[#c49d2d] text-black font-bold rounded-lg transition-colors"
          >
            Create First Market
          </a>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {markets.map(({ market, stats }) => (
            <MarketCard
              key={market.id}
              market={market}
              stats={stats}
              onBetPlaced={fetchMarkets}
            />
          ))}
        </div>
      )}
    </div>
  );
}
