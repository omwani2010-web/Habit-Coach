
import React, { useState, useEffect, useRef } from 'react';

const FocusTimer: React.FC = () => {
  const [seconds, setSeconds] = useState(1500); // Default 25m
  const [isActive, setIsActive] = useState(false);
  const [task, setTask] = useState('');
  const [showTaskInput, setShowTaskInput] = useState(true);
  // Using number instead of NodeJS.Timeout for browser environment compatibility
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && seconds > 0) {
      timerRef.current = window.setInterval(() => {
        setSeconds(s => s - 1);
      }, 1000) as unknown as number;
    } else if (seconds === 0) {
      setIsActive(false);
      if (timerRef.current) clearInterval(timerRef.current as number);
      alert("Focus session complete! Great work.");
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current as number);
    };
  }, [isActive, seconds]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!task && showTaskInput) {
      alert("Please enter a task to focus on.");
      return;
    }
    setShowTaskInput(false);
    setIsActive(true);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-700">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Focus Mode</h2>
        <p className="text-slate-500 dark:text-slate-400">One task. Zero distractions.</p>
      </div>

      <div className="relative w-64 h-64 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle 
            cx="128" cy="128" r="120" 
            className="stroke-slate-100 dark:stroke-slate-800 fill-none stroke-[8]" 
          />
          <circle 
            cx="128" cy="128" r="120" 
            className="stroke-emerald-500 fill-none stroke-[8] transition-all duration-1000" 
            strokeDasharray="754"
            strokeDashoffset={754 - (754 * seconds) / 1500}
            strokeLinecap="round"
          />
        </svg>
        <div className="text-5xl font-black text-slate-800 dark:text-slate-100 tabular-nums">
          {formatTime(seconds)}
        </div>
      </div>

      {showTaskInput ? (
        <div className="w-full max-w-sm space-y-4">
          <input 
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="What are we focusing on?" 
            className="w-full p-5 rounded-[24px] bg-white dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm text-center font-bold"
          />
          <div className="flex gap-2 justify-center">
            {[10, 15, 25].map(m => (
              <button 
                key={m}
                onClick={() => setSeconds(m * 60)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${seconds === m * 60 ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}
              >
                {m}m
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Current Task</p>
          <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-200">{task}</h3>
        </div>
      )}

      <div className="flex gap-4">
        <button 
          onClick={() => {
            setIsActive(false);
            setSeconds(1500);
            setShowTaskInput(true);
            setTask('');
          }}
          className="px-8 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          Reset
        </button>
        <button 
          onClick={() => setIsActive(!isActive)}
          className={`px-12 py-4 rounded-2xl font-bold text-sm shadow-xl transition-all active:scale-95 ${isActive ? 'bg-amber-500 text-white shadow-amber-100' : 'bg-emerald-500 text-white shadow-emerald-100'}`}
        >
          {isActive ? 'Pause' : 'Start Focus'}
        </button>
      </div>
    </div>
  );
};

export default FocusTimer;
