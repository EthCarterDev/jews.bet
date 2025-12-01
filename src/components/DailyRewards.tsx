import { Gift, Lock, Calendar } from 'lucide-react';

export function DailyRewards() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Daily Rewards</h2>
          <p className="text-gray-400">Earn rewards by logging in every day</p>
        </div>
        <Gift className="w-12 h-12 text-[#FFD700]" />
      </div>

      <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-12 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-900 mb-6">
          <Lock className="w-12 h-12 text-gray-600" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">Coming Soon</h3>
        <p className="text-gray-400 max-w-md mx-auto mb-6">
          Daily rewards system is currently under development. Soon you'll be able to earn
          SOL rewards just by logging in every day!
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-lg text-[#FFD700]">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-semibold">Stay tuned for updates</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
          <h4 className="text-white font-semibold mb-3">Planned Features</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-[#FFD700] mt-0.5">•</span>
              Daily login rewards with increasing bonuses
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FFD700] mt-0.5">•</span>
              Weekly and monthly milestone rewards
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FFD700] mt-0.5">•</span>
              Streak bonuses for consecutive logins
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FFD700] mt-0.5">•</span>
              Special event rewards and promotions
            </li>
          </ul>
        </div>

        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
          <h4 className="text-white font-semibold mb-3">How It Will Work</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              Log in daily to claim your reward
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              Maintain your streak for bonus multipliers
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              Rewards automatically credited to your balance
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              No deposits required - free SOL for active users
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
