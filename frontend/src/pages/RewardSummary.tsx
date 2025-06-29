import React, { useState, useEffect } from 'react';
import { User } from '../services/api';
import { Trophy, Star, Calendar, Gift, Award, Crown, Sparkles } from 'lucide-react';

interface RewardSummaryProps {
  currentUser: User | null;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
  earnedDate?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface DailyReward {
  date: string;
  xp: number;
  coins: number;
  streakDay: number;
  claimed: boolean;
}

interface WeeklyProgress {
  week: string;
  totalXP: number;
  totalCoins: number;
  tasksCompleted: number;
  streakDays: number;
  badges: string[];
}

const RewardSummary: React.FC<RewardSummaryProps> = ({ currentUser }) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [dailyRewards, setDailyRewards] = useState<DailyReward[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress[]>([]);
  const [selectedTab, setSelectedTab] = useState<'daily' | 'weekly' | 'badges'>('daily');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRewardsData();
  }, [currentUser]);

  const loadRewardsData = async () => {
    try {
      setIsLoading(true);
      
      // For demo purposes, we'll use mock data
      // In production, these would be API calls:
      // const badgesData = await apiService.getUserBadges(currentUser?.id);
      // const dailyData = await apiService.getDailyRewards(currentUser?.id);
      // const weeklyData = await apiService.getWeeklyProgress(currentUser?.id);
      
      // Mock badges data
      const mockBadges: Badge[] = [
        {
          id: '1',
          name: 'First Steps',
          description: 'Complete your first task',
          icon: <Award className="w-6 h-6" />,
          earned: true,
          earnedDate: '2024-01-15',
          rarity: 'common'
        },
        {
          id: '2',
          name: 'Streak Master',
          description: 'Maintain a 7-day streak',
          icon: <Star className="w-6 h-6" />,
          earned: true,
          earnedDate: '2024-01-22',
          rarity: 'rare'
        },
        {
          id: '3',
          name: 'High Achiever',
          description: 'Reach level 10',
          icon: <Crown className="w-6 h-6" />,
          earned: false,
          rarity: 'epic'
        },
        {
          id: '4',
          name: 'Task Goddess',
          description: 'Complete 100 tasks',
          icon: <Sparkles className="w-6 h-6" />,
          earned: false,
          rarity: 'legendary'
        }
      ];

      // Mock daily rewards
      const mockDailyRewards: DailyReward[] = [
        { date: '2024-01-28', xp: 50, coins: 25, streakDay: 15, claimed: true },
        { date: '2024-01-27', xp: 45, coins: 20, streakDay: 14, claimed: true },
        { date: '2024-01-26', xp: 40, coins: 18, streakDay: 13, claimed: true },
        { date: '2024-01-25', xp: 35, coins: 15, streakDay: 12, claimed: true },
        { date: '2024-01-24', xp: 55, coins: 30, streakDay: 11, claimed: true },
      ];

      // Mock weekly progress
      const mockWeeklyProgress: WeeklyProgress[] = [
        {
          week: 'Jan 22-28, 2024',
          totalXP: 320,
          totalCoins: 165,
          tasksCompleted: 12,
          streakDays: 7,
          badges: ['streak-master']
        },
        {
          week: 'Jan 15-21, 2024',
          totalXP: 280,
          totalCoins: 140,
          tasksCompleted: 10,
          streakDays: 6,
          badges: ['first-steps']
        }
      ];

      setBadges(mockBadges);
      setDailyRewards(mockDailyRewards);
      setWeeklyProgress(mockWeeklyProgress);
    } catch (error) {
      console.error('Error loading rewards data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-slate-400 to-slate-500';
      case 'rare': return 'from-blue-400 to-blue-500';
      case 'epic': return 'from-purple-400 to-purple-500';
      case 'legendary': return 'from-yellow-400 to-yellow-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-slate-300';
      case 'rare': return 'border-blue-300';
      case 'epic': return 'border-purple-300';
      case 'legendary': return 'border-yellow-300';
      default: return 'border-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-primary-200 rounded-full mx-auto mb-4"></div>
          <p className="text-primary-600">Loading rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="px-6 pt-6 pb-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold text-primary-800 mb-1">
            Rewards & Achievements
          </h1>
          <p className="text-primary-600">Your amazing progress journey</p>
        </div>

        {/* Current Level & Progress */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-primary-800">Level {currentUser?.level || 9}</h3>
              <p className="text-sm text-primary-600">Experience Points</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-primary-800">{currentUser?.xp || 890} XP</p>
              <p className="text-sm text-primary-600">of {currentUser?.next_level_xp || 900} XP</p>
            </div>
          </div>
          <div className="w-full bg-primary-100 rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${((currentUser?.xp || 890) / (currentUser?.next_level_xp || 900)) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-primary-600 text-center">
            {(currentUser?.next_level_xp || 900) - (currentUser?.xp || 890)} XP to next level
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-white/60 backdrop-blur-sm rounded-2xl p-1 mb-6">
          {[
            { id: 'daily', label: 'Daily', icon: Calendar },
            { id: 'weekly', label: 'Weekly', icon: Gift },
            { id: 'badges', label: 'Badges', icon: Award }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedTab(id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                selectedTab === id
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                  : 'text-primary-600 hover:bg-white/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{label}</span>
            </button>
          ))}
        </div>

        {/* Content based on selected tab */}
        {selectedTab === 'daily' && (
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-primary-800 mb-4">Daily Rewards</h3>
            {dailyRewards.map((reward, index) => (
              <div key={reward.date} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-primary-800">
                      {new Date(reward.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p className="text-sm text-primary-600">Streak Day {reward.streakDay}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="font-semibold text-primary-800">{reward.xp}</p>
                      <p className="text-xs text-primary-600">XP</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-secondary-800">{reward.coins}</p>
                      <p className="text-xs text-secondary-600">₹</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${reward.claimed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTab === 'weekly' && (
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-primary-800 mb-4">Weekly Progress</h3>
            {weeklyProgress.map((week, index) => (
              <div key={week.week} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/50">
                <h4 className="font-semibold text-primary-800 mb-4">{week.week}</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-primary-50 rounded-xl">
                    <p className="font-bold text-primary-800 text-lg">{week.totalXP}</p>
                    <p className="text-xs text-primary-600">Total XP</p>
                  </div>
                  <div className="text-center p-3 bg-secondary-50 rounded-xl">
                    <p className="font-bold text-secondary-800 text-lg">{week.totalCoins}</p>
                    <p className="text-xs text-secondary-600">Total ₹</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-xl">
                    <p className="font-bold text-purple-800 text-lg">{week.tasksCompleted}</p>
                    <p className="text-xs text-purple-600">Tasks Done</p>
                  </div>
                  <div className="text-center p-3 bg-pink-50 rounded-xl">
                    <p className="font-bold text-pink-800 text-lg">{week.streakDays}</p>
                    <p className="text-xs text-pink-600">Streak Days</p>
                  </div>
                </div>
                {week.badges.length > 0 && (
                  <div>
                    <p className="text-sm text-primary-600 mb-2">Badges Earned:</p>
                    <div className="flex gap-2">
                      {week.badges.map(badgeId => (
                        <div key={badgeId} className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                          <Award className="w-4 h-4 text-white" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {selectedTab === 'badges' && (
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-primary-800 mb-4">Achievement Badges</h3>
            <div className="grid grid-cols-2 gap-4">
              {badges.map((badge) => (
                <div 
                  key={badge.id} 
                  className={`bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 ${
                    badge.earned ? getRarityBorder(badge.rarity) : 'border-gray-200'
                  } ${badge.earned ? '' : 'opacity-60'}`}
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${
                    badge.earned ? getRarityColor(badge.rarity) : 'from-gray-300 to-gray-400'
                  } rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                    <div className={badge.earned ? 'text-white' : 'text-gray-500'}>
                      {badge.icon}
                    </div>
                  </div>
                  <h4 className="font-semibold text-primary-800 text-center mb-1 text-sm">
                    {badge.name}
                  </h4>
                  <p className="text-xs text-primary-600 text-center mb-2">
                    {badge.description}
                  </p>
                  <div className="text-center">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      badge.rarity === 'common' ? 'bg-slate-100 text-slate-700' :
                      badge.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                      badge.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {badge.rarity}
                    </span>
                  </div>
                  {badge.earned && badge.earnedDate && (
                    <p className="text-xs text-primary-500 text-center mt-2">
                      Earned {new Date(badge.earnedDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardSummary;
