import { useState } from 'react';
import { X, Copy, ArrowLeft } from 'lucide-react';
import QRCode from 'qrcode';
import { useEffect, useRef } from 'react';

interface FundWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
}

export function FundWalletModal({ isOpen, onClose, walletAddress }: FundWalletModalProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen && !isFlipped && canvasRef.current && walletAddress) {
      QRCode.toCanvas(canvasRef.current, walletAddress, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
    }
  }, [isOpen, isFlipped, walletAddress]);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setIsFlipped(false), 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-md" style={{ perspective: '1000px' }}>
        <div
          className={`relative w-full transition-transform duration-700 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          <div
            className="bg-[#1a1a1a] rounded-2xl border border-gray-800 shadow-2xl backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <h2 className="text-2xl font-bold text-white text-center mb-2">
                Fund wallet by crypto transfer
              </h2>

              <div className="flex items-center justify-center mb-6">
                <div className="bg-white p-4 rounded-xl">
                  <canvas ref={canvasRef} />
                </div>
              </div>

              <div className="text-center mb-6">
                <p className="text-gray-400 mb-2">or</p>
                <div className="flex items-center justify-center gap-2">
                  <code className="text-[#14F195] font-mono text-sm">
                    {formatAddress(walletAddress)}
                  </code>
                  <button
                    onClick={copyAddress}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                {copied && (
                  <p className="text-[#14F195] text-sm mt-2">Copied!</p>
                )}
              </div>

              <div className="bg-[#0a0a0a] rounded-lg p-4 space-y-2">
                <p className="text-sm text-gray-400">
                  Only send <span className="text-white font-semibold">SOL</span> to this address on{' '}
                  <span className="text-white font-semibold">Solana network</span>
                </p>
                <p className="text-sm text-gray-500">
                  Balance updates may take a few seconds
                </p>
              </div>

              <button
                onClick={() => setIsFlipped(true)}
                className="w-full mt-6 py-3 bg-[#9945FF] hover:bg-[#7d3ad4] text-white font-semibold rounded-lg transition-colors"
              >
                Other funding options
              </button>
            </div>
          </div>

          <div
            className="absolute top-0 left-0 w-full bg-[#1a1a1a] rounded-2xl border border-gray-800 shadow-2xl backface-hidden rotate-y-180"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setIsFlipped(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-400" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <h2 className="text-2xl font-bold text-white mb-6">
                Funding Options
              </h2>

              <div className="space-y-3">
                <button className="w-full p-4 bg-[#0a0a0a] hover:bg-gray-900 border border-gray-800 rounded-lg transition-colors text-left">
                  <div className="font-semibold text-white mb-1">Buy with Card</div>
                  <div className="text-sm text-gray-400">Purchase SOL with credit/debit card</div>
                </button>

                <button className="w-full p-4 bg-[#0a0a0a] hover:bg-gray-900 border border-gray-800 rounded-lg transition-colors text-left">
                  <div className="font-semibold text-white mb-1">Bridge from Ethereum</div>
                  <div className="text-sm text-gray-400">Transfer from ETH network</div>
                </button>

                <button className="w-full p-4 bg-[#0a0a0a] hover:bg-gray-900 border border-gray-800 rounded-lg transition-colors text-left">
                  <div className="font-semibold text-white mb-1">Exchange Transfer</div>
                  <div className="text-sm text-gray-400">Send from Coinbase, Binance, etc.</div>
                </button>

                <button
                  onClick={() => setIsFlipped(false)}
                  className="w-full p-4 bg-[#9945FF] hover:bg-[#7d3ad4] border border-[#9945FF] rounded-lg transition-colors text-left"
                >
                  <div className="font-semibold text-white mb-1">Crypto Transfer</div>
                  <div className="text-sm text-white/80">Direct SOL transfer via QR code</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
