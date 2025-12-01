'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import BalanceWidget from './BalanceWidget';

export default function PrivyLoginButton() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const [isBootstrapped, setIsBootstrapped] = useState(false);

  useEffect(() => {
    if (ready && authenticated && user && !isBootstrapped) {
      bootstrapUser();
    }
  }, [ready, authenticated, user, isBootstrapped]);

  const bootstrapUser = async () => {
    if (!user) return;

    const walletAddress = user.wallet?.address || null;
    const email = user.email?.address || null;

    try {
      const response = await fetch('/api/bootstrap-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          privyUserId: user.id,
          email,
          walletAddress,
        }),
      });

      if (response.ok) {
        setIsBootstrapped(true);
      }
    } catch (error) {
      console.error('Error bootstrapping user:', error);
    }
  };

  if (!ready) {
    return (
      <div className="h-10 w-24 bg-gray-800 animate-pulse rounded-lg"></div>
    );
  }

  if (!authenticated) {
    return (
      <button
        onClick={login}
        className="px-6 py-2 bg-[#d4af37] hover:bg-[#c49d2d] text-black font-bold rounded-lg transition-colors"
      >
        Login
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <BalanceWidget />
      <button
        onClick={logout}
        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
      >
        Logout
      </button>
    </div>
  );
}
