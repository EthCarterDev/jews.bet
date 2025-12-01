import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Plus, Search, Flame, Sparkles } from 'lucide-react';
import { Header } from './components/Header';
import { EventCard } from './components/EventCard';
import { CreateEventModal } from './components/CreateEventModal';
import { BetModal } from './components/BetModal';
import { DepositModal } from './components/DepositModal';
import { WithdrawalModal } from './components/WithdrawalModal';
import { ScrollingBanner } from './components/ScrollingBanner';
import { UsernameSetupModal } from './components/UsernameSetupModal';
import { FundWalletModal } from './components/FundWalletModal';
import { SolanaWalletPrompt } from './components/SolanaWalletPrompt';
import { Leaderboards } from './components/Leaderboards';
import { Progression } from './components/Progression';
import { DailyRewards } from './components/DailyRewards';
import { Referrals } from './components/Referrals';
import { api } from './lib/api';
import { Event } from './types';
import { useAuth } from './contexts/AuthContext';

type TabType = 'markets' | 'leaderboards' | 'progression' | 'rewards' | 'referrals';

function App() {
  const { authenticated } = usePrivy();
  const { user, updateUsername, needsSolanaWallet } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('markets');
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'HOT' | 'NEW'>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBetModalOpen, setIsBetModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  const fetchEvents = async () => {
    try {
      const markets = await api.getMarkets();
      setEvents(markets);
    } catch (error) {
      console.error('Error fetching markets:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let filtered = [...events];

    if (searchQuery) {
      filtered = filtered.filter((event) =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filter === 'HOT') {
      filtered = filtered.filter((event) => event.spots_taken > 0);
      filtered.sort((a, b) => b.spots_taken - a.spots_taken);
    } else if (filter === 'NEW') {
      filtered.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    setFilteredEvents(filtered);
  }, [events, searchQuery, filter]);

  const handleBetClick = (event: Event, side: 'YES' | 'NO') => {
    if (!authenticated) {
      alert('Please login to place a bet');
      return;
    }
    setSelectedEvent({ ...event, _preBetSide: side } as any);
    setIsBetModalOpen(true);
  };

  const handleCreateEventClick = () => {
    if (!authenticated) {
      alert('Please login to create an event');
      return;
    }
    setIsCreateModalOpen(true);
  };

  useEffect(() => {
    if (authenticated && user && !user.username) {
      setShowUsernameModal(true);
    } else {
      setShowUsernameModal(false);
    }
  }, [authenticated, user]);

  const handleUsernameSubmit = async (username: string) => {
    await updateUsername(username);
    setShowUsernameModal(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header
        onWalletClick={() => setIsDepositModalOpen(true)}
        onFund={() => setIsFundModalOpen(true)}
        onWithdraw={() => setIsWithdrawalModalOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {events.length > 0 && <ScrollingBanner events={events} />}

      <main className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-[#1a1a1a] rounded-lg px-4 py-2 border border-gray-800">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'ALL'
                    ? 'bg-[#FFD700] text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                ALL CATEGORIES
              </button>
              <button
                onClick={() => setFilter('HOT')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  filter === 'HOT'
                    ? 'bg-red-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Flame size={16} />
                HOT
              </button>
              <button
                onClick={() => setFilter('NEW')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  filter === 'NEW'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Sparkles size={16} />
                NEW
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bets..."
                className="bg-[#1a1a1a] border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-[#FFD700] focus:outline-none w-80"
              />
            </div>

            <button
              onClick={handleCreateEventClick}
              className="bg-[#FFD700] hover:bg-[#FFC700] text-black px-6 py-2 rounded-lg font-bold transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Create Event
            </button>
          </div>
        </div>

        {activeTab === 'markets' && (
          <>
            {!authenticated ? (
              <div className="text-center py-20">
                <div className="inline-block p-6 bg-[#1a1a1a] rounded-xl border border-gray-800">
                  <p className="text-gray-400 mb-4">
                    Please login to view and create prediction markets
                  </p>
                </div>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-block p-6 bg-[#1a1a1a] rounded-xl border border-gray-800">
                  <p className="text-gray-400 mb-4">
                    No events found. Create the first one!
                  </p>
                  <button
                    onClick={handleCreateEventClick}
                    className="bg-[#FFD700] hover:bg-[#FFC700] text-black px-6 py-2 rounded-lg font-bold transition-colors"
                  >
                    Create Event
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onBetYes={(e) => handleBetClick(e, 'YES')}
                    onBetNo={(e) => handleBetClick(e, 'NO')}
                    onResolved={fetchEvents}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'leaderboards' && <Leaderboards />}

        {activeTab === 'progression' && (
          <>
            {!authenticated ? (
              <div className="text-center py-20">
                <div className="inline-block p-6 bg-[#1a1a1a] rounded-xl border border-gray-800">
                  <p className="text-gray-400 mb-4">
                    Please login to view your progression
                  </p>
                </div>
              </div>
            ) : (
              <Progression />
            )}
          </>
        )}

        {activeTab === 'rewards' && <DailyRewards />}

        {activeTab === 'referrals' && <Referrals />}
      </main>

      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEventCreated={fetchEvents}
      />

      <BetModal
        isOpen={isBetModalOpen}
        onClose={() => {
          setIsBetModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onBetPlaced={fetchEvents}
      />

      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />

      <WithdrawalModal
        isOpen={isWithdrawalModalOpen}
        onClose={() => setIsWithdrawalModalOpen(false)}
      />

      {showUsernameModal && (
        <UsernameSetupModal onSubmit={handleUsernameSubmit} />
      )}

      {user?.wallet_address && (
        <FundWalletModal
          isOpen={isFundModalOpen}
          onClose={() => setIsFundModalOpen(false)}
          walletAddress={user.wallet_address}
        />
      )}

      {authenticated && needsSolanaWallet && !showUsernameModal && (
        <SolanaWalletPrompt />
      )}
    </div>
  );
}

export default App;
