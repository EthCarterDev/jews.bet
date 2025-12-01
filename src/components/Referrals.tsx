import { Users, Lock, Share2, DollarSign, Copy } from 'lucide-react';

export function Referrals() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Referrals</h2>
          <p className="text-gray-400">Invite friends and earn rewards</p>
        </div>
        <Users className="w-12 h-12 text-[#FFD700]" />
      </div>

      <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-12 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-900 mb-6">
          <Lock className="w-12 h-12 text-gray-600" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">Coming Soon</h3>
        <p className="text-gray-400 max-w-md mx-auto mb-6">
          Our referral program is currently under development. Soon you'll be able to earn
          rewards by inviting your friends to Jews.Bet!
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-lg text-[#FFD700]">
          <Share2 className="w-4 h-4" />
          <span className="text-sm font-semibold">Referral system launching soon</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FFD700]/10 mb-4">
            <Users className="w-6 h-6 text-[#FFD700]" />
          </div>
          <h4 className="text-white font-semibold mb-2">Invite Friends</h4>
          <p className="text-sm text-gray-400">
            Share your unique referral link with friends and family
          </p>
        </div>

        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FFD700]/10 mb-4">
            <DollarSign className="w-6 h-6 text-[#FFD700]" />
          </div>
          <h4 className="text-white font-semibold mb-2">Earn Rewards</h4>
          <p className="text-sm text-gray-400">
            Get bonus SOL when your referrals place their first bet
          </p>
        </div>

        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FFD700]/10 mb-4">
            <Share2 className="w-6 h-6 text-[#FFD700]" />
          </div>
          <h4 className="text-white font-semibold mb-2">Lifetime Earnings</h4>
          <p className="text-sm text-gray-400">
            Earn a percentage of your referrals' betting volume
          </p>
        </div>
      </div>

      <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
        <h4 className="text-white font-semibold mb-4">Planned Rewards Structure</h4>
        <div className="space-y-3">
          <div className="bg-[#0a0a0a] rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Sign-up Bonus</div>
              <div className="text-sm text-gray-400">
                When your friend signs up and verifies
              </div>
            </div>
            <div className="text-[#FFD700] font-bold">0.05 SOL</div>
          </div>

          <div className="bg-[#0a0a0a] rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="text-white font-medium">First Bet Bonus</div>
              <div className="text-sm text-gray-400">
                When your friend places their first bet
              </div>
            </div>
            <div className="text-[#FFD700] font-bold">0.1 SOL</div>
          </div>

          <div className="bg-[#0a0a0a] rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Revenue Share</div>
              <div className="text-sm text-gray-400">
                Ongoing percentage of betting volume
              </div>
            </div>
            <div className="text-[#FFD700] font-bold">5%</div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#FFD700]/10 to-transparent border border-[#FFD700]/30 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-[#FFD700] flex items-center justify-center">
              <Copy className="w-5 h-5 text-black" />
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-1">Get Notified</h4>
            <p className="text-sm text-gray-400 mb-3">
              Want to be the first to know when the referral program launches? We'll notify
              all users via email and in-app notifications.
            </p>
            <button
              disabled
              className="px-4 py-2 bg-[#FFD700] text-black rounded-lg font-semibold text-sm opacity-50 cursor-not-allowed"
            >
              Notify Me (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
