import { Event } from '../types';

interface ScrollingBannerProps {
  events: Event[];
}

export function ScrollingBanner({ events }: ScrollingBannerProps) {
  const recentEvents = events.slice(0, 5);

  return (
    <div className="bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-purple-900/20 border-y border-gray-800 overflow-hidden">
      <div className="flex animate-scroll">
        {[...recentEvents, ...recentEvents, ...recentEvents].map(
          (event, index) => (
            <div
              key={`${event.id}-${index}`}
              className="flex items-center gap-3 px-8 py-4 whitespace-nowrap"
            >
              <div className="w-8 h-8 bg-[#FFD700] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-black font-bold text-xs">
                  {event.creator?.username?.charAt(0) || 'U'}
                </span>
              </div>
              <span className="text-white text-sm">
                <span className="text-[#FFD700] font-bold">
                  @{event.creator?.username || 'Unknown'}
                </span>{' '}
                just bet{' '}
                <span className="text-[#FFD700] font-bold">
                  {event.creator_bet_amount} SOL
                </span>{' '}
                against{' '}
                <span className="text-white font-semibold">{event.title}</span>
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
