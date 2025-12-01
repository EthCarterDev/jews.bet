import { usePrivy } from '@privy-io/react-auth';
import { useAuth } from '../contexts/AuthContext';
import { UserProfileDropdown } from './UserProfileDropdown';

interface HeaderProps {
  onWalletClick: () => void;
  onFund: () => void;
  onWithdraw: () => void;
  activeTab: string;
  onTabChange: (tab: 'markets' | 'leaderboards' | 'progression' | 'rewards' | 'referrals') => void;
}

export function Header({ onWalletClick, onFund, onWithdraw, activeTab, onTabChange }: HeaderProps) {
  const { login, logout, authenticated } = usePrivy();
  const { user } = useAuth();

  return (
    <header className="bg-[#0a0a0a] border-b border-gray-800">
      <div className="max-w-[1400px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <img
                src="/f266e188-5416-4587-9f30-50a0b17d2a54.png"
                alt="Jews.Bet Logo"
                className="w-10 h-10 object-contain"
              />
              <span className="text-white font-bold text-xl">Jews.Bet</span>
            </div>

            <nav className="flex items-center gap-6">
              <button
                onClick={() => onTabChange('markets')}
                className={`transition-colors font-medium ${
                  activeTab === 'markets' ? 'text-[#FFD700]' : 'text-gray-400 hover:text-white'
                }`}
              >
                Bets
              </button>
              <button
                onClick={() => onTabChange('leaderboards')}
                className={`transition-colors font-medium ${
                  activeTab === 'leaderboards' ? 'text-[#FFD700]' : 'text-gray-400 hover:text-white'
                }`}
              >
                Leaderboards
              </button>
              <button
                onClick={() => onTabChange('progression')}
                className={`transition-colors font-medium ${
                  activeTab === 'progression' ? 'text-[#FFD700]' : 'text-gray-400 hover:text-white'
                }`}
              >
                Progression
              </button>
              <button
                onClick={() => onTabChange('rewards')}
                className={`transition-colors font-medium ${
                  activeTab === 'rewards' ? 'text-[#FFD700]' : 'text-gray-400 hover:text-white'
                }`}
              >
                Daily Rewards
              </button>
              <button
                onClick={() => onTabChange('referrals')}
                className={`transition-colors font-medium ${
                  activeTab === 'referrals' ? 'text-[#FFD700]' : 'text-gray-400 hover:text-white'
                }`}
              >
                Referrals
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {authenticated && user ? (
              <UserProfileDropdown
                user={user}
                onFund={onFund}
                onWithdraw={onWithdraw}
                onLogout={logout}
              />
            ) : (
              <button
                onClick={login}
                className="bg-[#FFD700] hover:bg-[#FFC700] text-black px-8 py-2 rounded-lg font-bold transition-colors"
              >
                LOGIN
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
