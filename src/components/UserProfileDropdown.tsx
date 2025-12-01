import { useState, useRef, useEffect } from 'react';
import { Copy, LogOut } from 'lucide-react';
import { User } from '../types';

interface UserProfileDropdownProps {
  user: User;
  onFund: () => void;
  onWithdraw: () => void;
  onLogout: () => void;
}

export function UserProfileDropdown({ user, onFund, onWithdraw, onLogout }: UserProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const copyAddress = () => {
    if (user.wallet_address) {
      navigator.clipboard.writeText(user.wallet_address);
    }
  };

  const getInitials = () => {
    if (user.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const formatAddress = (address: string | null) => {
    if (!address) return 'No wallet';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-[#14F195] hover:bg-[#12d683] flex items-center justify-center font-bold text-black text-lg transition-colors"
      >
        {getInitials()}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-[#1a1a1a] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden z-50">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-[#14F195] flex items-center justify-center font-bold text-black text-2xl">
                {getInitials()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">
                    {user.username || 'Capper'}
                  </h3>
                  <span className="text-gray-400">→</span>
                  <span className="text-gray-400">Challenger</span>
                </div>
                <div className="text-sm text-gray-400 mt-1">Level 1</div>
                <div className="text-xs text-gray-500 mt-1">
                  Just getting started in the betting world
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">0 / 400 XP</span>
                <span className="text-sm text-gray-400">400 TO NEXT</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#14F195]" style={{ width: '0%' }} />
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-b border-gray-800 mb-4">
              <span className="text-gray-400">@{user.username || 'prefer'}</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">
                  {formatAddress(user.wallet_address)}
                </span>
                {user.wallet_address && (
                  <button
                    onClick={copyAddress}
                    className="p-1 hover:bg-gray-800 rounded transition-colors"
                  >
                    <Copy className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            <div className="bg-[#0a0a0a] rounded-xl p-4 mb-4">
              <div className="text-sm text-gray-400 mb-2">My Wallet</div>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-gray-400 text-sm">Available:</span>
                  <span className="text-2xl font-bold text-white">
                    {user.balance_available.toFixed(4)} SOL
                  </span>
                </div>
                {user.balance_locked > 0 && (
                  <div className="flex items-baseline justify-between">
                    <span className="text-gray-400 text-sm">Locked in bets:</span>
                    <span className="text-xl font-semibold text-[#FFD700]">
                      {user.balance_locked.toFixed(4)} SOL
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mb-4">
              <button
                onClick={() => {
                  onFund();
                  setIsOpen(false);
                }}
                className="flex-1 py-3 bg-[#9945FF] hover:bg-[#7d3ad4] text-white font-semibold rounded-lg transition-colors"
              >
                FUND
              </button>
              <button
                onClick={() => {
                  onWithdraw();
                  setIsOpen(false);
                }}
                className="flex-1 py-3 bg-[#9945FF] hover:bg-[#7d3ad4] text-white font-semibold rounded-lg transition-colors"
              >
                WITHDRAW
              </button>
            </div>

            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className="w-full py-3 text-red-400 hover:text-red-300 font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              LOG OUT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
