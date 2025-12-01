import { AlertCircle, Wallet } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';

interface SolanaWalletPromptProps {
  onClose?: () => void;
}

export function SolanaWalletPrompt({ onClose }: SolanaWalletPromptProps) {
  const { connectWallet } = usePrivy();

  const handleConnectWallet = () => {
    connectWallet();
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-[#1a1a1a] border-2 border-[#FFD700] rounded-2xl max-w-md w-full p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-[#FFD700]/10 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-[#FFD700]" />
          </div>
          <h2 className="text-2xl font-bold text-white">Solana Wallet Required</h2>
        </div>

        <div className="space-y-4 mb-8">
          <p className="text-gray-300 leading-relaxed">
            To use deposits, withdrawals, and betting features, you need a Solana wallet.
          </p>

          <div className="bg-[#0a0a0a] rounded-lg p-4 border border-gray-800">
            <p className="text-sm text-gray-400 mb-3">
              <strong className="text-white">Option 1: Connect External Wallet</strong>
            </p>
            <p className="text-sm text-gray-500 mb-3">
              Connect a Solana wallet like Phantom, Solflare, or Backpack.
            </p>
            <button
              onClick={handleConnectWallet}
              className="w-full bg-[#FFD700] hover:bg-[#FFC700] text-black px-6 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Wallet size={20} />
              Connect Solana Wallet
            </button>
          </div>

          <div className="bg-[#0a0a0a] rounded-lg p-4 border border-gray-800">
            <p className="text-sm text-gray-400 mb-2">
              <strong className="text-white">Option 2: Contact Support</strong>
            </p>
            <p className="text-sm text-gray-500">
              If you logged in with Google/Twitter/Email, your embedded Solana wallet should have been created automatically.
              If you see this message, please contact support.
            </p>
          </div>
        </div>

        <div className="text-xs text-gray-600 text-center">
          This platform requires Solana mainnet for all transactions
        </div>
      </div>
    </div>
  );
}
