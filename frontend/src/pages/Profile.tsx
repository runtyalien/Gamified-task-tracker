import React, { useState, useEffect } from 'react';
import { User } from '../services/api';
import { 
  User as UserIcon, 
  Settings, 
  Crown, 
  Star, 
  Trophy,
  Target,
  Camera,
  Bell,
  Shield,
  Palette,
  Moon,
  Volume2,
  ChevronRight,
  LogOut,
  Edit3
} from 'lucide-react';

interface ProfileProps {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlockedAt: string;
}

interface UserStats {
  totalTasks: number;
  completedTasks: number;
  totalXP: number;
  totalCoins: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  nextLevelXP: number;
  joinedDate: string;
}

const Profile: React.FC<ProfileProps> = ({ currentUser, setCurrentUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      
      // For demo purposes, we'll use mock data
      // In production, this would be an API call:
      // const statsData = await apiService.getUserStats(currentUser?.id);
      // const achievementsData = await apiService.getRecentAchievements(currentUser?.id);
      
      // Mock user stats
      const mockStats: UserStats = {
        totalTasks: 156,
        completedTasks: 134,
        totalXP: currentUser?.xp || 890,
        totalCoins: currentUser?.rs_earned || 445,
        currentStreak: currentUser?.streak_count || 15,
        longestStreak: 28,
        level: currentUser?.level || 9,
        nextLevelXP: currentUser?.next_level_xp || 900,
        joinedDate: currentUser?.created_at || '2024-01-01'
      };

      // Mock recent achievements
      const mockAchievements: Achievement[] = [
        {
          id: '1',
          title: 'Streak Master',
          description: 'Maintained a 15-day streak',
          icon: <Star className="w-5 h-5" />,
          unlockedAt: '2024-01-28'
        },
        {
          id: '2',
          title: 'Task Warrior',
          description: 'Completed 100+ tasks',
          icon: <Trophy className="w-5 h-5" />,
          unlockedAt: '2024-01-25'
        },
        {
          id: '3',
          title: 'Level Up',
          description: 'Reached Level 9',
          icon: <Crown className="w-5 h-5" />,
          unlockedAt: '2024-01-20'
        }
      ];

      setUserStats(mockStats);
      setRecentAchievements(mockAchievements);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!currentUser || !name.trim()) return;

    try {
      // In production, this would be an API call:
      // await apiService.updateUserProfile(currentUser.id, { name: name.trim() });
      
      // Update local state
      setCurrentUser({
        ...currentUser,
        name: name.trim()
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleLogout = () => {
    // In production, this would clear auth tokens and redirect
    setCurrentUser(null);
    // Redirect to login page or refresh app
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-primary-200 rounded-full mx-auto mb-4"></div>
          <p className="text-primary-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const completionRate = userStats ? Math.round((userStats.completedTasks / userStats.totalTasks) * 100) : 0;
  const levelProgress = userStats ? Math.round((userStats.totalXP / userStats.nextLevelXP) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="px-6 pt-6 pb-4">
        {/* Profile Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/50">
          <div className="flex items-center gap-4 mb-4">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center">
                <UserIcon className="w-10 h-10 text-white" />
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-primary-100">
                <Camera className="w-3 h-3 text-primary-600" />
              </button>
            </div>

            {/* Name and Level */}
            <div className="flex-1">
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white rounded-lg border border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-primary-800"
                    placeholder="Enter your name"
                  />
                  <button
                    onClick={handleSaveName}
                    className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-display font-bold text-primary-800">
                    {currentUser?.name || 'User'}
                  </h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 hover:bg-primary-100 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4 text-primary-600" />
                  </button>
                </div>
              )}
              
              <div className="flex items-center gap-2 mt-1">
                <Crown className="w-4 h-4 text-yellow-500" />
                <span className="text-primary-600 font-medium">Level {userStats?.level}</span>
                <span className="text-primary-400">•</span>
                <span className="text-primary-600">{userStats?.totalXP} XP</span>
              </div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-primary-600 mb-2">
              <span>Level Progress</span>
              <span>{levelProgress}%</span>
            </div>
            <div className="w-full bg-primary-100 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${levelProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-primary-50 rounded-xl">
              <p className="font-bold text-primary-800 text-lg">{userStats?.totalCoins}</p>
              <p className="text-xs text-primary-600">₹ Earned</p>
            </div>
            <div className="text-center p-3 bg-secondary-50 rounded-xl">
              <p className="font-bold text-secondary-800 text-lg">{userStats?.currentStreak}</p>
              <p className="text-xs text-secondary-600">Day Streak</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-xl">
              <p className="font-bold text-purple-800 text-lg">{completionRate}%</p>
              <p className="text-xs text-purple-600">Completion</p>
            </div>
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/50">
          <h3 className="font-display font-semibold text-primary-800 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Recent Achievements
          </h3>
          <div className="space-y-3">
            {recentAchievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white">
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-primary-800">{achievement.title}</p>
                  <p className="text-sm text-primary-600">{achievement.description}</p>
                </div>
                <p className="text-xs text-primary-500">
                  {new Date(achievement.unlockedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/50">
          <h3 className="font-display font-semibold text-primary-800 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-500" />
            Your Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-primary-50 rounded-xl">
              <p className="font-bold text-primary-800 text-2xl">{userStats?.completedTasks}</p>
              <p className="text-sm text-primary-600">Tasks Completed</p>
            </div>
            <div className="text-center p-4 bg-secondary-50 rounded-xl">
              <p className="font-bold text-secondary-800 text-2xl">{userStats?.totalTasks}</p>
              <p className="text-sm text-secondary-600">Total Tasks</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <p className="font-bold text-purple-800 text-2xl">{userStats?.longestStreak}</p>
              <p className="text-sm text-purple-600">Longest Streak</p>
            </div>
            <div className="text-center p-4 bg-pink-50 rounded-xl">
              <p className="font-bold text-pink-800 text-2xl">
                {userStats?.joinedDate ? Math.floor((new Date().getTime() - new Date(userStats.joinedDate).getTime()) / (1000 * 60 * 60 * 24)) : 0}
              </p>
              <p className="text-sm text-pink-600">Days Active</p>
            </div>
          </div>
        </div>

        {/* Settings Menu */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/50">
          <h3 className="font-display font-semibold text-primary-800 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary-500" />
            Settings
          </h3>
          <div className="space-y-1">
            {[
              { icon: Bell, label: 'Notifications', action: () => {} },
              { icon: Palette, label: 'Theme', action: () => {} },
              { icon: Moon, label: 'Dark Mode', action: () => {} },
              { icon: Volume2, label: 'Sound Effects', action: () => {} },
              { icon: Shield, label: 'Privacy', action: () => {} },
            ].map(({ icon: Icon, label, action }) => (
              <button
                key={label}
                onClick={action}
                className="w-full flex items-center justify-between p-3 hover:bg-primary-50 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-primary-600" />
                  <span className="text-primary-800">{label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-primary-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-4 rounded-2xl font-medium transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Profile;
