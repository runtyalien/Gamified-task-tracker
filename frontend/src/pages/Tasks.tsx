import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Target, CheckCircle } from 'lucide-react';
import { User, Task, apiService } from '../services/api';

interface TasksProps {
  currentUser: User | null;
}

const Tasks: React.FC<TasksProps> = ({ currentUser }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setIsLoading(true);
        const allTasks = await apiService.getTasks();
        setTasks(allTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
        // Fallback to mock data if API fails
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
        <div className="max-w-md mx-auto pt-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="text-primary-600 mt-4">Loading tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-6 rounded-b-3xl">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-display font-bold mb-2">All Tasks</h1>
          <p className="text-primary-100">Complete tasks to earn XP and rewards</p>
        </div>
      </div>

      {/* Tasks List */}
      <div className="max-w-md mx-auto p-4 -mt-4">
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-primary-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary-800 mb-2">No Tasks Available</h3>
              <p className="text-primary-600">Check back later for new tasks!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <Link
                key={task.id}
                to={`/task/${task.id}`}
                className="block bg-white rounded-2xl p-4 shadow-sm border border-primary-100 hover:shadow-md hover:border-primary-200 transition-all duration-200"
              >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-primary-800 font-display">
                            {task.name}
                          </h3>
                          <p className="text-sm text-primary-600">
                            {task.subtasks.length} subtask{task.subtasks.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-primary-600 mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-accent-600">
                          <span className="font-semibold">₹{task.reward_rs}</span>
                        </div>
                        <div className="flex items-center gap-1 text-secondary-600">
                          <span className="font-semibold">{task.reward_xp} XP</span>
                        </div>
                        <div className={`flex items-center gap-1 ${task.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                          <CheckCircle className="w-3 h-3" />
                          <span className="text-xs">{task.is_active ? 'Active' : 'Inactive'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <ChevronRight className="w-5 h-5 text-primary-400" />
                  </div>
                </Link>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasks;
