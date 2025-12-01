import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Award, Coins } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface LeaderboardEntry extends User {
  total_bets: number;
  total_wagered: number;
  wins: number;
  win_rate: number;
  profit: number;
  rank: number;
}

export function Leaderboards() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'profit' | 'wins' | 'wagered'>('profit');

  useEffect(() => {
    fetchLeaderboard();
  }, [sortBy]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .order('balance_available', { ascending: false });

      if (error) throw error;

      const { data: bets, error: betsError } = await supabase
        .from('bets')
        .select('user_id, amount, status, payout');

      if (betsError) throw betsError;

      const leaderboardData: LeaderboardEntry[] = (users || []).map((u) => {
        const userBets = (bets || []).filter((b) => b.user_id === u.id);
        const totalBets = userBets.length;
        const totalWagered = userBets.reduce((sum, b) => sum + Number(b.amount), 0);
        const wins = userBets.filter((b) => b.status === 'WON').length;
        const winRate = totalBets > 0 ? (wins / totalBets) * 100 : 0;

        const totalWinnings = userBets
          .filter((b) => b.status === 'WON')
          .reduce((sum, b) => sum + Number(b.payout || 0), 0);

        const profit = totalWinnings - totalWagered;

        return {
          ...u,
          total_bets: totalBets,
          total_wagered: totalWagered,
          wins,
          win_rate: winRate,
          profit,
          rank: 0,
        };
      });

      leaderboardData.sort((a, b) => {
        if (sortBy === 'profit') return b.profit - a.profit;
        if (sortBy === 'wins') return b.wins - a.wins;
        return b.total_wagered - a.total_wagered;
      });

      leaderboardData.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-[#FFD700]" />;
    if (rank === 2) return <Trophy className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Trophy className="w-6 h-6 text-amber-700" />;
    return <span className="text-gray-500 font-bold w-6 text-center">{rank}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Leaderboards</h2>
          <p className="text-gray-400">Top prediction market traders</p>
        </div>
        <Trophy className="w-12 h-12 text-[#FFD700]" />
      </div>

      <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSortBy('profit')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              sortBy === 'profit'
                ? 'bg-[#FFD700] text-black'
                : 'bg-[#0a0a0a] text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp size={16} />
              Top Profit
            </div>
          </button>
          <button
            onClick={() => setSortBy('wins')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              sortBy === 'wins'
                ? 'bg-[#FFD700] text-black'
                : 'bg-[#0a0a0a] text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Award size={16} />
              Most Wins
            </div>
          </button>
          <button
            onClick={() => setSortBy('wagered')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              sortBy === 'wagered'
                ? 'bg-[#FFD700] text-black'
                : 'bg-[#0a0a0a] text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Coins size={16} />
              Total Wagered
            </div>
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Loading leaderboard...</div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No data yet. Be the first to place a bet!
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.slice(0, 50).map((entry) => (
              <div
                key={entry.id}
                className={`bg-[#0a0a0a] rounded-lg p-4 flex items-center gap-4 border transition-colors ${
                  entry.id === user?.id
                    ? 'border-[#FFD700] bg-[#FFD700]/5'
                    : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(entry.rank)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold truncate">
                      {entry.username || `User ${entry.id.slice(0, 6)}`}
                    </span>
                    {entry.id === user?.id && (
                      <span className="text-xs bg-[#FFD700] text-black px-2 py-0.5 rounded font-bold">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    <span>{entry.total_bets} bets</span>
                    <span>•</span>
                    <span>{entry.wins} wins</span>
                    <span>•</span>
                    <span>{entry.win_rate.toFixed(1)}% win rate</span>
                  </div>
                </div>

                <div className="text-right">
                  {sortBy === 'profit' && (
                    <div>
                      <div
                        className={`font-bold font-mono ${
                          entry.profit >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {entry.profit >= 0 ? '+' : ''}
                        {entry.profit.toFixed(4)} SOL
                      </div>
                      <div className="text-xs text-gray-500">profit</div>
                    </div>
                  )}
                  {sortBy === 'wins' && (
                    <div>
                      <div className="font-bold text-[#FFD700]">{entry.wins}</div>
                      <div className="text-xs text-gray-500">wins</div>
                    </div>
                  )}
                  {sortBy === 'wagered' && (
                    <div>
                      <div className="font-bold text-white font-mono">
                        {entry.total_wagered.toFixed(4)} SOL
                      </div>
                      <div className="text-xs text-gray-500">wagered</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
