import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import RewardSummary from './pages/RewardSummary';
import Profile from './pages/Profile';
import BottomNavigation from './components/BottomNavigation';
import { User, apiService } from './services/api';

const DEMO_USER_ID = '686053e5069ed8946b40b12c'; // Akanksha's real user ID from latest seed

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load real user data from backend
    const loadUser = async () => {
      try {
        setIsLoading(true);
        // Try to load user from backend
        const userId = DEMO_USER_ID;
        
        try {
          // Try to get the user from the backend API
          const userData = await apiService.getUser(userId);
          setCurrentUser(userData);
        } catch (apiError) {
          console.warn('Failed to load user from API, using demo data:', apiError);
          // Fallback to demo user if API fails
          // setCurrentUser({
          //   id: userId,
          //   name: 'Akanksha Gadkar',
          //   xp: 890,
          //   rs_earned: 445,
          //   level: 9,
          //   streak_count: 15,
          //   next_level_xp: 900,
          //   created_at: new Date().toISOString()
          // });
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        // Final fallback to demo user
        // setCurrentUser({
        //   id: DEMO_USER_ID,
        //   name: 'Akanksha Gadkar',
        //   xp: 890,
        //   rs_earned: 445,
        //   level: 9,
        //   streak_count: 15,
        //   next_level_xp: 900,
        //   created_at: new Date().toISOString()
        // });
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center mb-4 mx-auto animate-pulse">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-display font-semibold text-primary-800 mb-2">TaskTracker</h2>
          <p className="text-primary-600">Loading your magical journey...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <main className="pb-20"> {/* Space for bottom navigation */}
          <Routes>
            <Route 
              path="/" 
              element={<Dashboard currentUser={currentUser} />} 
            />
            <Route 
              path="/tasks" 
              element={<Tasks currentUser={currentUser} />} 
            />
            <Route 
              path="/task/:taskId" 
              element={<TaskDetail currentUser={currentUser} />} 
            />
            <Route 
              path="/rewards" 
              element={<RewardSummary currentUser={currentUser} />} 
            />
            <Route 
              path="/profile" 
              element={<Profile currentUser={currentUser} setCurrentUser={setCurrentUser} />} 
            />
          </Routes>
        </main>
        
        <BottomNavigation />
      </div>
    </Router>
  );
}

export default App;
