
import React, { useState } from 'react';
import { Habit, Barrier } from '../types';
import { BARRIER_SOLUTIONS } from '../constants';

interface HabitCardProps {
  habit: Habit;
  onCheckIn: (habit: Habit) => void;
  onRescue?: (habit: Habit) => void;
  onDelete?: (id: string) => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onCheckIn, onRescue, onDelete }) => {
  const [selectedBarrier, setSelectedBarrier] = useState<Barrier | null>(null);
  const today = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];

  const isDoneToday = habit.logs.some(log => log.date === today && log.completed);
  
  // Logic for Barriers Helper: If they missed yesterday and haven't done today yet
  // Refined: Only trigger if the habit has some history (logs.length > 0)
  const yesterdayLog = habit.logs.find(l => l.date === yesterday);
  const missedYesterday = !yesterdayLog || !yesterdayLog.completed;
  const isStruggling = habit.logs.length > 0 && habit.streak === 0 && missedYesterday && !isDoneToday;

  const barriers: { id: Barrier; label: string }[] = [
    { id: 'forgot', label: 'I forgot' },
    { id: 'no-time', label: 'No time' },
    { id: 'tired', label: 'Felt tired' },
    { id: 'not-feeling-it', label: "Didn't feel like it" },
  ];

  return (
    <div className={`p-5 rounded-3xl transition-all duration-300 transform hover:scale-[1.01] ${
      isDoneToday 
      ? 'bg-slate-50 dark:bg-slate-800/50 opacity-80 border border-transparent' 
      : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)]'
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
      
      {isStruggling && !isDoneToday && (
        <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/30 animate-in fade-in slide-in-from-top-2">
          {!selectedBarrier ? (
            <>
              <p className="text-[11px] font-bold text-amber-800 dark:text-amber-400 mb-3">What stopped you yesterday?</p>
              <div className="grid grid-cols-2 gap-2">
                {barriers.map(b => (
                  <button 
                    key={b.id} 
                    onClick={() => setSelectedBarrier(b.id)}
                    className="py-2 px-1 text-[10px] font-bold bg-white dark:bg-slate-700 rounded-xl border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors"
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400">💡 Coach Idea:</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed italic">
                "{BARRIER_SOLUTIONS[selectedBarrier]}"
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedBarrier(null)}
                  className="flex-1 py-2 text-[9px] font-black uppercase text-amber-600 bg-white rounded-lg border border-amber-200"
                >
                  Back
                </button>
                {onRescue && (
                  <button 
                    onClick={() => onRescue(habit)}
                    className="flex-1 py-2 text-[9px] font-black uppercase text-white bg-amber-500 rounded-lg shadow-sm"
                  >
                    Go Tiny
                  </button>
                )}
              </div>
            </div>
          )}
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
