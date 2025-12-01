import { useState, useEffect } from 'react';
import { TrendingUp, Target, Zap, Award, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface UserStats {
  totalBets: number;
  totalWagered: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  profit: number;
  biggestWin: number;
  currentStreak: number;
  bestStreak: number;
  marketsCreated: number;
  daysActive: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: number;
  target?: number;
}

export function Progression() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data: bets, error: betsError } = await supabase
        .from('bets')
        .select('*, event:events!bets_event_id_fkey(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (betsError) throw betsError;

      const { data: markets, error: marketsError } = await supabase
        .from('events')
        .select('id')
        .eq('creator_id', user.id);

      if (marketsError) throw marketsError;

      const totalBets = bets?.length || 0;
      const totalWins = bets?.filter((b) => b.status === 'WON').length || 0;
      const totalLosses = bets?.filter((b) => b.status === 'LOST').length || 0;
      const totalWagered = bets?.reduce((sum, b) => sum + Number(b.amount), 0) || 0;

      const totalWinnings =
        bets
          ?.filter((b) => b.status === 'WON')
          .reduce((sum, b) => sum + Number(b.payout || 0), 0) || 0;

      const profit = totalWinnings - totalWagered;
      const winRate = totalBets > 0 ? (totalWins / totalBets) * 100 : 0;

      const biggestWin = Math.max(
        0,
        ...(bets?.filter((b) => b.status === 'WON').map((b) => Number(b.payout || 0)) || [])
      );

      let currentStreak = 0;
      let bestStreak = 0;
      let streak = 0;

      bets
        ?.slice()
        .reverse()
        .forEach((bet) => {
          if (bet.status === 'WON') {
            streak++;
            if (currentStreak === 0 || bet === bets[bets.length - 1]) {
              currentStreak = streak;
            }
            bestStreak = Math.max(bestStreak, streak);
          } else if (bet.status === 'LOST') {
            streak = 0;
          }
        });

      const firstBetDate = bets && bets.length > 0 ? new Date(bets[0].created_at) : new Date();
      const daysActive = Math.ceil(
        (new Date().getTime() - firstBetDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const userStats: UserStats = {
        totalBets,
        totalWagered,
        totalWins,
        totalLosses,
        winRate,
        profit,
        biggestWin,
        currentStreak,
        bestStreak,
        marketsCreated: markets?.length || 0,
        daysActive: Math.max(1, daysActive),
      };

      setStats(userStats);

      const achievementsList: Achievement[] = [
        {
          id: 'first_bet',
          title: 'First Steps',
          description: 'Place your first bet',
          icon: <Target className="w-6 h-6" />,
          unlocked: totalBets >= 1,
        },
        {
          id: 'bet_10',
          title: 'Getting Started',
          description: 'Place 10 bets',
          icon: <Zap className="w-6 h-6" />,
          unlocked: totalBets >= 10,
          progress: Math.min(totalBets, 10),
          target: 10,
        },
        {
          id: 'bet_50',
          title: 'Active Trader',
          description: 'Place 50 bets',
          icon: <TrendingUp className="w-6 h-6" />,
          unlocked: totalBets >= 50,
          progress: Math.min(totalBets, 50),
          target: 50,
        },
        {
          id: 'first_win',
          title: 'Taste of Victory',
          description: 'Win your first bet',
          icon: <Award className="w-6 h-6" />,
          unlocked: totalWins >= 1,
        },
        {
          id: 'win_streak_3',
          title: 'Hot Streak',
          description: 'Win 3 bets in a row',
          icon: <Zap className="w-6 h-6" />,
          unlocked: bestStreak >= 3,
          progress: Math.min(bestStreak, 3),
          target: 3,
        },
        {
          id: 'win_streak_5',
          title: 'On Fire',
          description: 'Win 5 bets in a row',
          icon: <Zap className="w-6 h-6" />,
          unlocked: bestStreak >= 5,
          progress: Math.min(bestStreak, 5),
          target: 5,
        },
        {
          id: 'profitable',
          title: 'In Profit',
          description: 'Make a positive profit',
          icon: <DollarSign className="w-6 h-6" />,
          unlocked: profit > 0,
        },
        {
          id: 'create_market',
          title: 'Market Maker',
          description: 'Create your first market',
          icon: <Target className="w-6 h-6" />,
          unlocked: userStats.marketsCreated >= 1,
        },
        {
          id: 'week_active',
          title: 'One Week In',
          description: 'Stay active for 7 days',
          icon: <Calendar className="w-6 h-6" />,
          unlocked: daysActive >= 7,
          progress: Math.min(daysActive, 7),
          target: 7,
        },
      ];

      setAchievements(achievementsList);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-400">Loading your progression...</div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-gray-400">
        Unable to load stats. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Your Progression</h2>
          <p className="text-gray-400">Track your stats and unlock achievements</p>
        </div>
        <Award className="w-12 h-12 text-[#FFD700]" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Total Bets</div>
          <div className="text-2xl font-bold text-white">{stats.totalBets}</div>
        </div>
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Win Rate</div>
          <div className="text-2xl font-bold text-[#FFD700]">
            {stats.winRate.toFixed(1)}%
          </div>
        </div>
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Profit/Loss</div>
          <div
            className={`text-2xl font-bold font-mono ${
              stats.profit >= 0 ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {stats.profit >= 0 ? '+' : ''}
            {stats.profit.toFixed(3)}
          </div>
        </div>
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Win Streak</div>
          <div className="text-2xl font-bold text-white">
            {stats.currentStreak}
            <span className="text-sm text-gray-500 ml-2">(best: {stats.bestStreak})</span>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Detailed Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-[#0a0a0a] rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-2">Total Wagered</div>
            <div className="text-white font-mono font-semibold">
              {stats.totalWagered.toFixed(4)} SOL
            </div>
          </div>
          <div className="bg-[#0a0a0a] rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-2">Wins / Losses</div>
            <div className="text-white font-semibold">
              {stats.totalWins} / {stats.totalLosses}
            </div>
          </div>
          <div className="bg-[#0a0a0a] rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-2">Biggest Win</div>
            <div className="text-green-500 font-mono font-semibold">
              {stats.biggestWin.toFixed(4)} SOL
            </div>
          </div>
          <div className="bg-[#0a0a0a] rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-2">Markets Created</div>
            <div className="text-white font-semibold">{stats.marketsCreated}</div>
          </div>
          <div className="bg-[#0a0a0a] rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-2">Days Active</div>
            <div className="text-white font-semibold">{stats.daysActive}</div>
          </div>
          <div className="bg-[#0a0a0a] rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-2">Avg Bet Size</div>
            <div className="text-white font-mono font-semibold">
              {stats.totalBets > 0
                ? (stats.totalWagered / stats.totalBets).toFixed(4)
                : '0.0000'}{' '}
              SOL
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`rounded-lg p-4 border transition-all ${
                achievement.unlocked
                  ? 'bg-[#FFD700]/10 border-[#FFD700]'
                  : 'bg-[#0a0a0a] border-gray-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-lg ${
                    achievement.unlocked
                      ? 'bg-[#FFD700] text-black'
                      : 'bg-gray-800 text-gray-500'
                  }`}
                >
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`font-semibold ${
                        achievement.unlocked ? 'text-white' : 'text-gray-500'
                      }`}
                    >
                      {achievement.title}
                    </h4>
                    {achievement.unlocked && (
                      <span className="text-xs bg-[#FFD700] text-black px-2 py-0.5 rounded font-bold">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    {achievement.description}
                  </p>
                  {!achievement.unlocked &&
                    achievement.progress !== undefined &&
                    achievement.target !== undefined && (
                      <div className="mt-2">
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#FFD700] transition-all"
                            style={{
                              width: `${
                                (achievement.progress / achievement.target) * 100
                              }%`,
                            }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {achievement.progress} / {achievement.target}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
