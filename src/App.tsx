import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import FoodSearch from './components/FoodSearch';
import Profile from './components/Profile';
import History from './components/History';
import Recipes from './components/Recipes';
import AIChat from './components/AIChat';
import FloatingAIButton from './components/FloatingAIButton';
import Login from './components/Login';
import { useLocalStorage } from './hooks/useLocalStorage';
import { User, FoodEntry, DailyLog } from './types';
import { computeDailyTargets } from './utils/nutrition';
import { loadLocalFoodBase } from './utils/openFoodFacts';
import { getDailyLog, saveDailyLog, updateProfile, getProfile } from './utils/api';

function App() {
  const defaultUser = {
    name: 'Utilisateur',
    email: 'user@example.com',
    age: 30,
    weight: 70,
    height: 175,
    gender: 'homme' as const,
    activityLevel: 'modérée' as const,
    goal: 'maintien' as const,
    avatar: 'https://images.pexels.com/photos/1310474/pexels-photo-1310474.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    theme: 'dark' as const,
    notifications: true,
    password: 'password',
    stepGoal: 10000,
    dailyWater: 2000
  };

  const targets = computeDailyTargets(defaultUser);

  const [user, setUser] = useLocalStorage<User>('nutritalk-user', {
    ...defaultUser,
    dailyCalories: targets.calories,
    dailyProtein: targets.protein,
    dailyCarbs: targets.carbs,
    dailyFat: targets.fat,
    dailyWater: defaultUser.dailyWater
  });

  const [dailyLog, setDailyLog] = useLocalStorage<DailyLog>('nutritalk-daily-log', {
    date: new Date().toISOString().split('T')[0],
    entries: [],
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    water: 0,
    steps: 0,
    targetCalories: targets.calories,
    weight: defaultUser.weight
  });

  const [weightHistory, setWeightHistory] = useLocalStorage<{ date: string; weight: number }[]>('nutritalk-weight-history', []);

  const [loggedIn, setLoggedIn] = useLocalStorage<boolean>('nutritalk-logged-in', false);

  const [currentView, setCurrentView] = useState('dashboard');
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (user.theme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else if (user.theme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, [user.theme]);

  useEffect(() => {
    const foods = loadLocalFoodBase();
    console.log('First local foods', foods.slice(0, 5));
  }, []);

  useEffect(() => {
    if (loggedIn && user.id) {
      const today = new Date().toISOString().split('T')[0];
      getProfile(user.id).then(setUser).catch(() => {});
      getDailyLog(user.id, today).then(log => {
        if (log) setDailyLog(log);
      }).catch(() => {});
    }
  }, [loggedIn, user.id, setUser, setDailyLog]);

  useEffect(() => {
    if (loggedIn && user.id) {
      saveDailyLog(user.id, dailyLog.date, dailyLog).catch(() => {});
    }
  }, [dailyLog, loggedIn, user.id]);

  useEffect(() => {
    if (loggedIn && user.id) {
      updateProfile(user.id, user).catch(() => {});
    }
  }, [user, loggedIn, user.id]);

  if (!loggedIn) {
    return (
      <Login
        user={user}
        onLogin={(u) => {
          setUser(u);
          setLoggedIn(true);
        }}
      />
    );
  }

  const addFoodEntry = (entry: Omit<FoodEntry, 'id' | 'timestamp'>) => {
    const newEntry: FoodEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };

    const updatedLog = {
      ...dailyLog,
      entries: [...dailyLog.entries, newEntry],
      totalCalories: dailyLog.totalCalories + entry.calories,
      totalProtein: dailyLog.totalProtein + entry.protein,
      totalCarbs: dailyLog.totalCarbs + entry.carbs,
      totalFat: dailyLog.totalFat + entry.fat
    };

    setDailyLog(updatedLog);
    if (user.id) saveDailyLog(user.id, updatedLog.date, updatedLog).catch(() => {});
  };

  const importFoodEntries = (entries: FoodEntry[]) => {
    let updated = { ...dailyLog };
    for (const entry of entries) {
      const newEntry: FoodEntry = {
        ...entry,
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        timestamp: new Date().toISOString()
      };
      updated = {
        ...updated,
        entries: [...updated.entries, newEntry],
        totalCalories: updated.totalCalories + newEntry.calories,
        totalProtein: updated.totalProtein + newEntry.protein,
        totalCarbs: updated.totalCarbs + newEntry.carbs,
        totalFat: updated.totalFat + newEntry.fat
      };
    }
    setDailyLog(updated);
    if (user.id) saveDailyLog(user.id, updated.date, updated).catch(() => {});
  };

  const removeFoodEntry = (id: string) => {
    const entryToRemove = dailyLog.entries.find(entry => entry.id === id);
    if (!entryToRemove) return;

    const updatedLog = {
      ...dailyLog,
      entries: dailyLog.entries.filter(entry => entry.id !== id),
      totalCalories: dailyLog.totalCalories - entryToRemove.calories,
      totalProtein: dailyLog.totalProtein - entryToRemove.protein,
      totalCarbs: dailyLog.totalCarbs - entryToRemove.carbs,
      totalFat: dailyLog.totalFat - entryToRemove.fat
    };

    setDailyLog(updatedLog);
    if (user.id) saveDailyLog(user.id, updatedLog.date, updatedLog).catch(() => {});
  };

  const updateWater = (amount: number) => {
    setDailyLog(prev => {
      const updated = { ...prev, water: Math.max(0, prev.water + amount) };
      if (user.id) saveDailyLog(user.id, updated.date, updated).catch(() => {});
      return updated;
    });
  };

  const updateSteps = (amount: number) => {
    setDailyLog(prev => {
      const updated = { ...prev, steps: Math.max(0, prev.steps + amount) };
      if (user.id) saveDailyLog(user.id, updated.date, updated).catch(() => {});
      return updated;
    });
  };

  const updateWeight = (delta: number) => {
    const newWeight = Math.max(0, user.weight + delta);
    setUser(prev => ({ ...prev, weight: newWeight }));
    setDailyLog(prev => {
      const updated = { ...prev, weight: newWeight };
      if (user.id) saveDailyLog(user.id, updated.date, updated).catch(() => {});
      return updated;
    });
    const today = new Date().toISOString().split('T')[0];
    setWeightHistory(prev => {
      const filtered = prev.filter(p => p.date !== today);
      return [...filtered, { date: today, weight: newWeight }];
    });
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            user={user}
            dailyLog={dailyLog}
            onRemoveEntry={removeFoodEntry}
            onUpdateWater={updateWater}
            onUpdateSteps={updateSteps}
            onUpdateWeight={updateWeight}
            weightHistory={weightHistory}
          />
        );
      case 'search':
        return <FoodSearch onAddFood={addFoodEntry} />;
      case 'recipes':
        return <Recipes />;
      case 'profile':
        return (
          <Profile
            user={user}
            dailyLog={dailyLog}
            onUpdateUser={setUser}
            onImportEntries={importFoodEntries}
            onLogout={() => setLoggedIn(false)}
          />
        );
      case 'history':
        return <History user={user} weightHistory={weightHistory} />;
      default:
        return (
          <Dashboard
            user={user}
            dailyLog={dailyLog}
            onRemoveEntry={removeFoodEntry}
            onUpdateWater={updateWater}
            onUpdateSteps={updateSteps}
            onUpdateWeight={updateWeight}
            weightHistory={weightHistory}
          />
        );
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        isDarkMode={isDarkMode}
        onToggleTheme={() => {
          const newTheme = isDarkMode ? 'light' : 'dark';
          setUser(prev => ({ ...prev, theme: newTheme }));
        }}
      />
      
      <main className="container mx-auto px-4 py-6 pb-20">
        {renderView()}
      </main>

      <FloatingAIButton onClick={() => setIsAIChatOpen(true)} />
      
      {isAIChatOpen && (
        <AIChat 
          onClose={() => setIsAIChatOpen(false)} 
          onAddFood={addFoodEntry}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}

export default App;