
import React, { useState, useMemo } from 'react';
import { HABIT_PLANS, HABIT_LIBRARY } from '../constants';

interface HabitLibraryProps {
  onAddHabit: (name: string, goal: string, difficulty: 'tiny' | 'normal' | 'advanced') => void;
  onAddPlan: (plan: any) => void;
}

const HabitLibrary: React.FC<HabitLibraryProps> = ({ onAddHabit, onAddPlan }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLibrary = useMemo(() => {
    if (!searchQuery.trim()) return HABIT_LIBRARY;

    const query = searchQuery.toLowerCase();
    return HABIT_LIBRARY.map(category => {
      const categoryMatches = category.category.toLowerCase().includes(query);
      const matchingHabits = category.habits.filter(h => 
        h.name.toLowerCase().includes(query) || h.goal.toLowerCase().includes(query)
      );

      // If the category name matches, show all habits in that category
      // Otherwise, only show habits that match the query
      if (categoryMatches) {
        return category;
      } else if (matchingHabits.length > 0) {
        return { ...category, habits: matchingHabits };
      }
      return null;
    }).filter((cat): cat is typeof HABIT_LIBRARY[0] => cat !== null);
  }, [searchQuery]);

  return (
    <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Starter Plans</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Expertly bundled habits to help you reach a specific goal.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {HABIT_PLANS.map(plan => (
            <div key={plan.id} className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[40px] shadow-sm flex flex-col">
              <div className="text-4xl mb-4">{plan.icon}</div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">{plan.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">{plan.description}</p>
              
              <div className="space-y-2 mb-8 flex-1">
                {plan.habits.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl">
                    <span className="text-emerald-500">✓</span> {h.name}
                  </div>
                ))}
              </div>

              <button 
                onClick={() => onAddPlan(plan)}
                className="w-full py-3 bg-emerald-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-emerald-50 dark:shadow-none hover:bg-emerald-600 transition-all"
              >
                Adopt this Plan
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">Tiny Habit Library</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Browse hundreds of tiny behaviors. Click any to plant it.</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">🔍</span>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or category..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm transition-all text-sm dark:text-slate-100"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        
        <div className="space-y-10 min-h-[300px]">
          {filteredLibrary.length > 0 ? (
            filteredLibrary.map(cat => (
              <div key={cat.category} className="animate-in fade-in duration-300">
                <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 ml-2">{cat.category}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {cat.habits.map(h => (
                    <button 
                      key={h.name}
                      onClick={() => onAddHabit(h.name, h.goal, 'tiny')}
                      className="group p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl text-left hover:border-emerald-500 dark:hover:border-emerald-500 transition-all shadow-sm active:scale-95"
                    >
                      <div className="text-2xl mb-3 group-hover:scale-110 transition-transform">{h.icon}</div>
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{h.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">{h.goal}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">No habits found</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mt-2">
                "We couldn't find a habit matching "{searchQuery}". Try a different word or clear your search to browse the garden."
              </p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-6 px-6 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl hover:bg-emerald-100 transition-colors"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HabitLibrary;
