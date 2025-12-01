import { useState } from 'react';
import { Wallet, Plus, ArrowDownToLine } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DepositModal } from './DepositModal';
import { WithdrawalModal } from './WithdrawalModal';

export function BalanceWidget() {
  const { user } = useAuth();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);

  if (!user) return null;

  const formatBalance = (balance: number | null | undefined) => {
    const num = Number(balance || 0);
    return num.toFixed(4);
  };

  return (
    <>
      <div className="bg-black border border-[#FFD700] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Wallet className="w-5 h-5 text-[#FFD700]" />
          <h3 className="text-[#FFD700] font-semibold text-lg">Balance</h3>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Available:</span>
            <span className="text-white font-mono text-lg">
              {formatBalance(user.balance_available)} SOL
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Locked in Bets:</span>
            <span className="text-gray-500 font-mono">
              {formatBalance(user.balance_locked)} SOL
            </span>
          </div>
          <div className="h-px bg-gray-800 my-2" />
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Total:</span>
            <span className="text-[#FFD700] font-mono font-semibold text-lg">
              {formatBalance(
                Number(user.balance_available || 0) + Number(user.balance_locked || 0)
              )}{' '}
              SOL
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setShowDepositModal(true)}
            className="bg-[#9945FF] hover:bg-[#7d3ad4] text-white font-semibold py-2.5 px-4 rounded-lg
                     transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Deposit
          </button>

          <button
            onClick={() => setShowWithdrawalModal(true)}
            className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2.5 px-4 rounded-lg
                     transition-colors flex items-center justify-center gap-2"
          >
            <ArrowDownToLine className="w-4 h-4" />
            Withdraw
          </button>
        </div>

        <p className="text-xs text-gray-600 mt-2 text-center">
          Real SOL on Solana mainnet
        </p>
      </div>

      <DepositModal isOpen={showDepositModal} onClose={() => setShowDepositModal(false)} />
      <WithdrawalModal isOpen={showWithdrawalModal} onClose={() => setShowWithdrawalModal(false)} />
    </>
  );
}
