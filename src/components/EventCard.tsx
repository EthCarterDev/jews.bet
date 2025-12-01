import { useState } from 'react';
import { Event } from '../types';
import { Clock, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import { MarketResolutionPanel } from './MarketResolutionPanel';

interface EventCardProps {
  event: Event;
  onBetYes: (event: Event) => void;
  onBetNo: (event: Event) => void;
  onResolved?: () => void;
}

export function EventCard({ event, onBetYes, onBetNo, onResolved }: EventCardProps) {
  const [showAdmin, setShowAdmin] = useState(false);
  const getStatusBadge = () => {
    if (event.status === 'RESOLVED') {
      const isYesWinner = event.winner_side === 'YES';
      return (
        <div className={`absolute top-3 left-3 px-3 py-1 rounded text-xs font-bold ${
          isYesWinner
            ? 'bg-green-500/20 text-green-500'
            : 'bg-red-500/20 text-red-500'
        }`}>
          RESOLVED: {event.winner_side} WINS
        </div>
      );
    }
    if (event.status === 'CLOSED') {
      return (
        <div className="absolute top-3 left-3 bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded text-xs font-bold">
          CLOSED
        </div>
      );
    }
    if (event.status === 'CANCELED') {
      return (
        <div className="absolute top-3 left-3 bg-red-500/20 text-red-500 px-3 py-1 rounded text-xs font-bold">
          CANCELED
        </div>
      );
    }
    return (
      <div className="absolute top-3 left-3 bg-green-500/20 text-green-500 px-3 py-1 rounded text-xs font-bold">
        OPEN
      </div>
    );
  };

  const getTimeAgo = () => {
    const now = new Date();
    const created = new Date(event.created_at);
    const diff = Math.floor((now.getTime() - created.getTime()) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getTimeUntilClose = () => {
    if (!event.expires_at) return 'No deadline';
    const now = new Date();
    const expires = new Date(event.expires_at);
    const diff = Math.floor((expires.getTime() - now.getTime()) / 1000);

    if (diff < 0) return 'Expired';
    if (diff < 60) return `${diff}s left`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m left`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h left`;
    return `${Math.floor(diff / 86400)}d left`;
  };

  const yesVolume = Number(event.yes_volume || 0);
  const noVolume = Number(event.no_volume || 0);
  const totalVolume = yesVolume + noVolume;
  const yesPercent = totalVolume > 0 ? (yesVolume / totalVolume) * 100 : 50;
  const noPercent = totalVolume > 0 ? (noVolume / totalVolume) * 100 : 50;

  return (
    <div className="bg-[#1a1a1a] rounded-xl border-2 border-gray-800 hover:border-[#FFD700] transition-all duration-200 overflow-hidden relative group">
      {getStatusBadge()}

      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 bg-[#FFD700] rounded-lg flex items-center justify-center flex-shrink-0">
            <div className="w-12 h-12 bg-black/20 rounded-lg"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold mb-2 line-clamp-2">
              {event.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>@{event.creator?.username || 'Unknown'}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{getTimeAgo()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">PRIZE POOL</span>
            <span className="text-[#FFD700] font-bold">
              {event.prize_pool.toFixed(4)} SOL
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">CLOSES IN</span>
            <span className="text-white font-medium flex items-center gap-1">
              <Clock size={12} />
              {getTimeUntilClose()}
            </span>
          </div>

          <div className="bg-[#0a0a0a] rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-green-500 font-semibold text-sm">YES</span>
              </div>
              <div className="text-right">
                <div className="text-white font-mono text-sm">{yesVolume.toFixed(3)} SOL</div>
                <div className="text-gray-500 text-xs">{yesPercent.toFixed(0)}%</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span className="text-red-500 font-semibold text-sm">NO</span>
              </div>
              <div className="text-right">
                <div className="text-white font-mono text-sm">{noVolume.toFixed(3)} SOL</div>
                <div className="text-gray-500 text-xs">{noPercent.toFixed(0)}%</div>
              </div>
            </div>
          </div>
        </div>

        {event.status === 'OPEN' ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onBetYes(event)}
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <TrendingUp size={16} />
                BET YES
              </button>
              <button
                onClick={() => onBetNo(event)}
                className="bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <TrendingDown size={16} />
                BET NO
              </button>
            </div>

            <button
              onClick={() => setShowAdmin(!showAdmin)}
              className="w-full text-xs text-gray-500 hover:text-gray-300 py-1 flex items-center justify-center gap-1"
            >
              {showAdmin ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {showAdmin ? 'Hide' : 'Show'} Admin Controls
            </button>

            {showAdmin && (
              <MarketResolutionPanel
                market={event}
                onResolved={() => {
                  setShowAdmin(false);
                  onResolved?.();
                }}
              />
            )}
          </div>
        ) : (
          <div className="bg-gray-800 text-gray-500 font-bold py-2.5 rounded-lg text-center">
            BETTING CLOSED
          </div>
        )}
      </div>
    </div>
  );
}
