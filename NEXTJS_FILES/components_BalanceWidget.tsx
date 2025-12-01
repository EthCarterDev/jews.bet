'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { User } from '@/lib/types';

export default function BalanceWidget() {
  const { user: privyUser } = usePrivy();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (privyUser) {
      fetchUser();
    }
  }, [privyUser]);

  const fetchUser = async () => {
    if (!privyUser) return;

    try {
      const response = await fetch('/api/me', {
        headers: {
          'x-privy-user-id': privyUser.id,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFakeDeposit = async () => {
    if (!privyUser) return;

    try {
      const response = await fetch('/api/fake-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          privyUserId: privyUser.id,
          amount: 1.0,
        }),
      });

      if (response.ok) {
        fetchUser();
      }
    } catch (error) {
      console.error('Error depositing:', error);
    }
  };

  if (isLoading) {
    return <div className="h-10 w-32 bg-gray-800 animate-pulse rounded-lg"></div>;
  }

  if (!user) {
    return null;
  }

  const walletDisplay = user.wallet_address
    ? `${user.wallet_address.slice(0, 4)}...${user.wallet_address.slice(-4)}`
    : 'No wallet';

  return (
    <div className="flex items-center gap-4">
      <div className="text-right">
        <div className="text-sm text-gray-400">{walletDisplay}</div>
        <div className="text-lg font-bold text-[#d4af37]">
          {user.balance.toFixed(4)} SOL
        </div>
      </div>
      <button
        onClick={handleFakeDeposit}
        className="px-3 py-1 bg-[#1dbd85] hover:bg-[#18a574] text-white text-sm rounded-lg transition-colors"
      >
        +1 SOL
      </button>
    </div>
  );
}
