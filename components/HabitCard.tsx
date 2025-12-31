
import React from 'react';
import { Habit } from '../types';

interface HabitCardProps {
  habit: Habit;
  onCheckIn: (habit: Habit) => void;
  onRescue?: (habit: Habit) => void;
  onDelete?: (id: string) => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onCheckIn, onRescue, onDelete }) => {
  const today = new Date().toISOString().split('T')[0];
  const isDoneToday = habit.logs.some(log => log.date === today && log.completed);
  
  // Logic for Restart Mode detection: If streak is 0 and they have logs but nothing recently
  const lastLogDate = habit.logs.length > 0 ? habit.logs[habit.logs.length - 1].date : null;
  const isStruggling = habit.streak === 0 && lastLogDate && lastLogDate !== today;

  return (
    <div className={`p-5 rounded-3xl transition-all duration-300 ${
      isDoneToday 
      ? 'bg-slate-50 dark:bg-slate-800/50 opacity-80 border border-transparent' 
      : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 leading-tight">{habit.name}</h3>
            {habit.difficulty === 'tiny' && <span className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full font-bold">TINY</span>}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{habit.goal}</p>
          {habit.motivation && (
            <p className="text-[10px] italic text-slate-400 dark:text-slate-500 mt-2 border-l-2 border-emerald-100 dark:border-emerald-900 pl-2">
              Why: {habit.motivation}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-2xl text-[10px] font-black">
          🔥 {habit.streak}
        </div>
      </div>
      
      {isStruggling && !isDoneToday && onRescue && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/30">
          <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 mb-2">Feeling stuck? Let's rescue this habit.</p>
          <button 
            onClick={() => onRescue(habit)}
            className="w-full py-2 bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded-xl border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors"
          >
            Reduce to Tiny Step
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mt-auto pt-2">
        <div className="flex -space-x-1 overflow-hidden">
          {habit.logs.slice(-5).map((log, i) => (
            <div key={i} className={`w-2 h-2 rounded-full border border-white dark:border-slate-800 ${log.completed ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
          ))}
        </div>

        <button
          onClick={() => !isDoneToday && onCheckIn(habit)}
          disabled={isDoneToday}
          className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition-all ${
            isDoneToday 
            ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-default' 
            : 'bg-emerald-500 text-white shadow-lg shadow-emerald-100 dark:shadow-none hover:bg-emerald-600 active:scale-95'
          }`}
        >
          {isDoneToday ? 'Well Done!' : 'Check In'}
        </button>
      </div>
    </div>
  );
};

export default HabitCard;
