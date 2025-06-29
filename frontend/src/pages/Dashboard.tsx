import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ChevronRight, Calendar, Target, Award } from 'lucide-react';
import { User, TaskProgress, apiService } from '../services/api';
import { XPCard, CoinsCard, StreakCard, TasksCard } from '../components/StatsCard';
import { getCurrentDateIST } from '../utils/dateUtils';

interface DashboardProps {
  currentUser: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser }) => {
  const [tasks, setTasks] = useState<TaskProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [todayDate] = useState(getCurrentDateIST());

  const loadTodaysTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Loading tasks for user:', currentUser!.id, 'date:', todayDate);
      const progress = await apiService.getProgress(currentUser!.id, todayDate);
      console.log('Received progress:', progress);
      setTasks(progress);
    } catch (error) {
      console.error('Error loading tasks:', error);
      // Fallback to mock data when API fails
      setTasks([
        {
          task_id: '1',
          task_name: 'Morning Princess Ritual',
          task_key: 'morning-princess-ritual',
          description: 'Start your day like royalty with essential morning rituals',
          reward_rs: 100,
          reward_xp: 20,
          subtasks: [
            { key: 'brush', name: 'Brush', time_limit: 615, completed: false, submission: null },
            { key: 'bath', name: 'Bath', time_limit: 615, completed: false, submission: null },
            { key: 'clean-bed', name: 'Clean bed', time_limit: 615, completed: false, submission: null },
          ],
          progress: { completed: 0, total: 3, percentage: 0 },
          is_completed: false
        },
        {
          task_id: '2',
          task_name: 'Glow Goddess Routine',
          task_key: 'glow-goddess-routine',
          description: 'Complete your skin and hair care routine to maintain your goddess glow',
          reward_rs: 100,
          reward_xp: 20,
          subtasks: [
            { key: 'morning-skincare', name: 'Morning skin + hair care', time_limit: 645, completed: false, submission: null },
            { key: 'night-skincare', name: 'Night skin + hair care', time_limit: 1380, completed: false, submission: null },
            { key: 'hair-tablets', name: 'Hair tablets', time_limit: 1080, completed: false, submission: null },
          ],
          progress: { completed: 0, total: 3, percentage: 0 },
          is_completed: false
        },
        {
          task_id: '3',
          task_name: 'Castle Keeper Mission',
          task_key: 'castle-keeper-mission',
          description: 'Maintain your royal castle with cleaning duties',
          reward_rs: 200,
          reward_xp: 30,
          subtasks: [
            { key: 'cleaning', name: 'Cleaning', time_limit: 585, completed: false, submission: null },
            { key: 'mopping', name: 'Mopping', time_limit: 585, completed: false, submission: null },
          ],
          progress: { completed: 0, total: 2, percentage: 0 },
          is_completed: false
        },
        {
          task_id: '4',
          task_name: 'Knowledge Belle Challenge',
          task_key: 'knowledge-belle-challenge',
          description: 'Watch 5 YouTube videos to expand your knowledge',
          reward_rs: 100,
          reward_xp: 20,
          subtasks: [
            { key: 'watch-5-videos', name: 'Watch 5 YouTube videos', time_limit: 0, completed: false, submission: null },
          ],
          progress: { completed: 0, total: 1, percentage: 0 },
          is_completed: false
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, todayDate]);

  useEffect(() => {
    if (currentUser) {
      loadTodaysTasks();
    }
  }, [currentUser, loadTodaysTasks]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getTotalProgress = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.is_completed).length;
    const totalSubtasks = tasks.reduce((sum, t) => sum + t.progress.total, 0);
    const completedSubtasks = tasks.reduce((sum, t) => sum + t.progress.completed, 0);
    
    return {
      tasks: { completed: completedTasks, total: totalTasks },
      subtasks: { completed: completedSubtasks, total: totalSubtasks }
    };
  };

  const progress = getTotalProgress();

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="pt-12 pb-6 px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-primary-800">
              {getGreeting()}, {'Akanksha'}! ✨
            </h1>
            <p className="text-primary-600 mt-1">Ready to crush your goals today?</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {currentUser.name.charAt(0)}
            </span>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center space-x-2 text-primary-600 mb-6">
          <Calendar size={16} />
          <span className="text-sm font-medium">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="px-6 mb-8">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <XPCard 
            xp={currentUser.xp} 
            level={currentUser.level} 
            nextLevelXP={currentUser.next_level_xp} 
          />
          <CoinsCard coins={currentUser.rs_earned} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <StreakCard streak={currentUser.streak_count} />
          <TasksCard 
            completed={progress.subtasks.completed} 
            total={progress.subtasks.total} 
          />
        </div>
      </section>

      {/* Today's Tasks */}
      <section className="px-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-bold text-primary-800 flex items-center">
            <Target className="mr-2" size={20} />
            Today's Tasks
          </h2>
          <Link 
            to="/rewards" 
            className="text-primary-500 hover:text-primary-700 transition-colors"
          >
            <Award size={20} />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-primary-200 rounded mb-2"></div>
                <div className="h-3 bg-primary-100 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <Link
                key={task.task_id}
                to={`/task/${task.task_id}`}
                className="block"
              >
                <div className="card hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-3 h-3 rounded-full ${
                          task.is_completed 
                            ? 'bg-green-500' 
                            : task.progress.completed > 0 
                              ? 'bg-yellow-500' 
                              : 'bg-gray-300'
                        }`}></div>
                        <h3 className="font-semibold text-primary-800">{task.task_name}</h3>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-primary-600">
                            {task.progress.completed}/{task.progress.total} subtasks
                          </span>
                          <span className="text-primary-500 font-medium">
                            ₹{task.reward_rs} • {task.reward_xp}XP
                          </span>
                        </div>
                        
                        <div className="w-full bg-primary-100 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${task.progress.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <ChevronRight className="text-primary-400 ml-4" size={20} />
                  </div>
                </div>
              </Link>
            ))}

            {tasks.length === 0 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-primary-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Plus className="text-primary-500" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-primary-800 mb-2">No tasks for today</h3>
                <p className="text-primary-600">You're all caught up! 🎉</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section className="px-6 pb-8">
        <div className="grid grid-cols-2 gap-4">
          <Link 
            to="/rewards"
            className="card-gradient text-center py-6 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
          >
            <Award className="w-8 h-8 text-primary-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-primary-700">View Rewards</p>
          </Link>
          
          <Link 
            to="/profile"
            className="card-gradient text-center py-6 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
          >
            <Target className="w-8 h-8 text-secondary-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-secondary-700">Profile</p>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
