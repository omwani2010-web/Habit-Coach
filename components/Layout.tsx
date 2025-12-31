
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, isDarkMode, toggleDarkMode }) => {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: '🏠' },
    { id: 'habits', label: 'Garden', icon: '🌱' },
    { id: 'tools', label: 'Tools', icon: '🛠️' },
    { id: 'coach', label: 'Coach', icon: '✨' },
    { id: 'settings', label: 'Me', icon: '👤' },
  ];

  return (
    <div className={`flex flex-col md:flex-row min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-6 sticky top-0 h-screen z-40">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <span className="text-3xl">🌱</span> Habit Coach
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest font-semibold">Progress, not perfection</p>
        </div>

        <div className="flex-1 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                activeTab === tab.id 
                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-700">
          <button 
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 mb-4 transition-colors"
          >
            <span>{isDarkMode ? '☀️' : '🌙'}</span>
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-lg">
              👤
            </div>
            <div>
              <div className="text-sm font-bold">Builder</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">Consistency: High</div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="md:hidden p-6 pt-10 flex justify-between items-center bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 z-40">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Habit Coach</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Progress, not perfection.</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleDarkMode} className="text-xl">{isDarkMode ? '☀️' : '🌙'}</button>
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-lg">🌱</div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto max-w-7xl mx-auto w-full pb-28 md:pb-12">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-t border-slate-100 dark:border-slate-700 py-3 px-2 flex justify-around items-center z-50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center flex-1 transition-colors ${
              activeTab === tab.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <span className="text-xl mb-1">{tab.icon}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
