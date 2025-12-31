
import React, { useMemo } from 'react';
import { Habit, Mood } from '../types';
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { SCIENCE_TIPS } from '../constants';

interface DashboardProps {
  habits: Habit[];
}

const moodEmojiMap: Record<Mood, string> = {
  happy: '😊',
  okay: '😐',
  stressed: '😫',
  none: '😶',
};

const moodLabelMap: Record<Mood, string> = {
  happy: 'Feeling Great',
  okay: 'Doing Okay',
  stressed: 'A Bit Stressed',
  none: 'No Data Yet',
};

const Dashboard: React.FC<DashboardProps> = ({ habits }) => {
  const stats = useMemo(() => {
    const totalHabits = habits.length;
    const activeStreaks = habits.reduce((acc, h) => acc + h.streak, 0);
    
    // Flatten all logs
    const allLogs = habits.flatMap(h => h.logs.map(l => ({ ...l, habitName: h.name })));
    
    // Last 7 days chart data & dates for the grid
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      
      const dayLogs = allLogs.filter(l => l.date === dateStr && l.completed);
      const count = dayLogs.length;
      
      return { 
        name: d.toLocaleDateString('en-US', { weekday: 'short' }), 
        dateStr,
        count 
      };
    });

    // Calculate 7-day Consistency Rate
    const totalActualCompletions = last7Days.reduce((sum, day) => sum + day.count, 0);
    const totalPotentialCompletions = totalHabits * 7;
    const consistencyRate = totalPotentialCompletions > 0 
      ? (totalActualCompletions / totalPotentialCompletions) * 100 
      : 0;

    // Growth Score (Consistency + Effort + Tiny Improvements)
    // Basic calc: (Avg Streak * 10) + (Consistency Rate * 0.5)
    const avgStreak = habits.length > 0 ? activeStreaks / habits.length : 0;
    const growthScore = Math.min(100, Math.round((avgStreak * 5) + (consistencyRate * 0.5)));
    
    // Find latest small win
    const latestWin = [...allLogs].filter(l => l.notes?.win).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    // Mood calc (past 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentLogs = allLogs.filter(l => new Date(l.date) >= sevenDaysAgo && l.mood !== 'none');
    
    const moodCounts: Record<Mood, number> = { happy: 0, okay: 0, stressed: 0, none: 0 };
    recentLogs.forEach(l => {
      moodCounts[l.mood]++;
    });

    let dominantMood: Mood = 'none';
    let maxCount = 0;
    (Object.keys(moodCounts) as Mood[]).forEach(m => {
      if (moodCounts[m] > maxCount) {
        maxCount = moodCounts[m];
        dominantMood = m;
      }
    });

    const tip = SCIENCE_TIPS[Math.floor(Math.random() * SCIENCE_TIPS.length)];

    return { 
      totalHabits, 
      activeStreaks, 
      consistencyRate, 
      last7Days, 
      latestWin, 
      dominantMood, 
      moodCounts,
      growthScore,
      tip
    };
  }, [habits]);

  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-8xl mb-6">🪴</div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Your garden is empty</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-3">Add your first tiny habit to start growing. We support mastery of 1-3 goals at a time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Top Level Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30">
          <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-2">Growth Score</div>
          <div className="text-4xl font-bold text-emerald-900 dark:text-emerald-100">{stats.growthScore}%</div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-2 font-black">📈 IMPROVING</div>
        </div>
        <div className="p-6 rounded-3xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
          <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase mb-2">7d Consistency</div>
          <div className="text-4xl font-bold text-blue-900 dark:text-slate-100">{Math.round(stats.consistencyRate)}%</div>
          <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-2 font-black uppercase">✨ Show Up Rate</div>
        </div>
        <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
          <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase mb-2">Current Habits</div>
          <div className="text-4xl font-bold text-amber-900 dark:text-slate-100">{habits.length}/3</div>
          <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-2 font-black uppercase">🛡️ OVERWHELM SHIELD</div>
        </div>
        <div className="p-6 rounded-3xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30">
          <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-2">Focus Mood</div>
          <div className="text-4xl font-bold text-indigo-900 dark:text-slate-100">
            {moodEmojiMap[stats.dominantMood]}
          </div>
          <div className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-2 font-black uppercase">
            🌈 {moodLabelMap[stats.dominantMood]}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Chart */}
          <div className="p-8 rounded-[40px] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Consistency View</h3>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Completed Habits</span>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.last7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 12, fill: '#94a3b8'}} 
                    dy={10}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} allowDecimals={false} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc', opacity: 0.1}}
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: '#1e293b', color: '#fff'}}
                  />
                  <Bar dataKey="count" radius={[8, 8, 8, 8]} barSize={40}>
                    {stats.last7Days.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 6 ? '#10b981' : '#e2e8f0'} className="dark:fill-slate-700" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Per-Habit 7-Day Grid */}
          <div className="p-8 rounded-[40px] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Habits Currently Observing</h3>
                <span className="bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Doing all of them</span>
              </div>
              <div className="flex gap-2">
                {stats.last7Days.map(day => (
                  <div key={day.dateStr} className="w-8 text-center text-[8px] font-black text-slate-400 uppercase">
                    {day.name[0]}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {habits.map(habit => (
                <div key={habit.id} className="flex items-center justify-between group">
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-emerald-500 transition-colors">{habit.name}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">🔥 Streak: {habit.streak}</div>
                  </div>
                  <div className="flex gap-2">
                    {stats.last7Days.map(day => {
                      const log = habit.logs.find(l => l.date === day.dateStr && l.completed);
                      const isCompleted = !!log;
                      return (
                        <div 
                          key={day.dateStr} 
                          title={`${day.name}: ${isCompleted ? `Completed (${log.mood})` : 'Not completed'}`}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                            isCompleted 
                            ? 'bg-emerald-500 text-white shadow-sm' 
                            : 'bg-slate-50 dark:bg-slate-900 text-slate-200 dark:text-slate-800 border border-slate-100 dark:border-slate-700'
                          }`}
                        >
                          {isCompleted ? moodEmojiMap[log.mood] || '✓' : '•'}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="p-8 rounded-[40px] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
            <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Consistency Moods (7d)</h4>
            <div className="space-y-4">
              {(['happy', 'okay', 'stressed'] as Mood[]).map(m => (
                <div key={m} className="flex items-center gap-3">
                  <span className="text-2xl">{moodEmojiMap[m]}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1 uppercase">
                      <span>{m}</span>
                      <span>{stats.moodCounts[m]} logs</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          m === 'happy' ? 'bg-emerald-400' : m === 'okay' ? 'bg-blue-400' : 'bg-amber-400'
                        }`}
                        style={{ 
                          width: `${stats.moodCounts[m] > 0 ? (stats.moodCounts[m] / (stats.moodCounts.happy + stats.moodCounts.okay + stats.moodCounts.stressed || 1)) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-[40px] bg-indigo-600 text-white shadow-xl shadow-indigo-100 dark:shadow-none">
            <div className="text-3xl mb-4">🔬</div>
            <h4 className="text-lg font-bold mb-2">Habit Science</h4>
            <p className="text-indigo-100 text-sm leading-relaxed">
              {stats.tip}
            </p>
          </div>

          <div className="p-8 rounded-[40px] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm flex-1">
            <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Latest Achievement</h4>
            {stats.latestWin ? (
              <div className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="text-sm font-bold text-slate-700 dark:text-slate-200">"{stats.latestWin.notes?.win}"</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">— {stats.latestWin.habitName}</div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">No notes recorded yet. Mastery takes time.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
