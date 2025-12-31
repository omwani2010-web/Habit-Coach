
import React, { useState } from 'react';
import { WeeklyReflection } from '../types';

interface WeeklyReflectionProps {
  onSave: (reflection: Omit<WeeklyReflection, 'id' | 'weekStarting'>) => void;
  history: WeeklyReflection[];
}

const WeeklyReflectionView: React.FC<WeeklyReflectionProps> = ({ onSave, history }) => {
  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('');
  const [q3, setQ3] = useState('');
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = () => {
    if (!q1 || !q2 || !q3) return alert("Please answer all questions to reflect deeply.");
    onSave({ answers: { q1, q2, q3 } });
    setIsDone(true);
  };

  if (isDone) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="text-6xl animate-bounce">🌱</div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Reflection Saved</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-xs">Growth comes from self-awareness. See you next week for your next review!</p>
        <button onClick={() => setIsDone(false)} className="mt-8 text-emerald-600 font-bold hover:underline">Write another?</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Weekly Reflection</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Check in with your journey. No wrong answers.</p>
      </div>

      <div className="space-y-8 bg-white dark:bg-slate-800 p-8 md:p-12 rounded-[40px] border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-200 block">1. What went well this week?</label>
          <textarea 
            value={q1}
            onChange={(e) => setQ1(e.target.value)}
            placeholder="Focus on your tiny wins..." 
            className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none outline-none text-sm dark:text-slate-100 min-h-[100px]"
          />
        </div>
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-200 block">2. What was your biggest challenge?</label>
          <textarea 
            value={q2}
            onChange={(e) => setQ2(e.target.value)}
            placeholder="It's okay to have rough days. What happened?" 
            className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none outline-none text-sm dark:text-slate-100 min-h-[100px]"
          />
        </div>
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-200 block">3. One tiny improvement for next week?</label>
          <textarea 
            value={q3}
            onChange={(e) => setQ3(e.target.value)}
            placeholder="Something so small it's impossible to fail..." 
            className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none outline-none text-sm dark:text-slate-100 min-h-[100px]"
          />
        </div>

        <button 
          onClick={handleSubmit}
          className="w-full py-5 bg-emerald-500 text-white rounded-[24px] font-bold shadow-xl shadow-emerald-100 dark:shadow-none hover:bg-emerald-600 transition-all text-lg"
        >
          Complete Review
        </button>
      </div>

      {history.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">Past Reflections</h3>
          <div className="grid gap-4">
            {history.map(ref => (
              <div key={ref.id} className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl">
                <div className="text-[10px] font-bold text-emerald-600 mb-2 uppercase tracking-tighter">Week of {new Date(ref.weekStarting).toLocaleDateString()}</div>
                <div className="text-xs text-slate-600 dark:text-slate-300 italic">"{ref.answers.q1.substring(0, 100)}..."</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyReflectionView;
