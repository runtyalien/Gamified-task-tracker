import React from 'react';
import { CheckCircle, Clock, Star, Zap } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  gradient: string;
  badge?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  gradient,
  badge
}) => {
  return (
    <div className={`card-gradient ${gradient} text-white relative overflow-hidden`}>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-white/20 rounded-xl">
            {icon}
          </div>
          {badge && (
            <span className="badge bg-white/20 text-white text-xs">
              {badge}
            </span>
          )}
        </div>
        
        <div className="space-y-1">
          <h3 className="text-2xl font-bold font-display">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
          <p className="text-sm opacity-90">{title}</p>
          {subtitle && (
            <p className="text-xs opacity-75">{subtitle}</p>
          )}
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full"></div>
      <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full"></div>
    </div>
  );
};

// Predefined stat components
export const XPCard: React.FC<{ xp: number; level: number; nextLevelXP: number }> = ({ xp, level, nextLevelXP }) => {
  return (
    <StatsCard
      title="Experience"
      value={xp}
      subtitle={`${100 - (xp % 100)} XP to level ${level + 1}`}
      icon={<Zap size={20} />}
      gradient="bg-gradient-to-br from-purple-500 to-purple-700"
      badge={`Level ${level}`}
    />
  );
};

export const CoinsCard: React.FC<{ coins: number }> = ({ coins }) => (
  <StatsCard
    title="Rewards Earned"
    value={`₹${coins}`}
    icon={<Star size={20} />}
    gradient="bg-gradient-to-br from-yellow-500 to-orange-500"
  />
);

export const StreakCard: React.FC<{ streak: number }> = ({ streak }) => (
  <StatsCard
    title="Current Streak"
    value={`${streak} days`}
    subtitle={streak > 0 ? 'Keep it up!' : 'Start your streak today!'}
    icon={<CheckCircle size={20} />}
    gradient="bg-gradient-to-br from-green-500 to-emerald-600"
    badge={streak >= 7 ? '🔥' : undefined}
  />
);

export const TasksCard: React.FC<{ completed: number; total: number }> = ({ completed, total }) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return (
    <StatsCard
      title="Today's Progress"
      value={`${completed}/${total}`}
      subtitle={`${percentage}% completed`}
      icon={<Clock size={20} />}
      gradient="bg-gradient-to-br from-primary-500 to-secondary-500"
    />
  );
};

export default StatsCard;
