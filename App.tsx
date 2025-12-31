
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import HabitCard from './components/HabitCard';
import CheckInModal from './components/CheckInModal';
import Dashboard from './components/Dashboard';
import LiveCoachOverlay from './components/LiveCoachOverlay';
import FocusTimer from './components/FocusTimer';
import HabitLibrary from './components/HabitLibrary';
import WeeklyReflectionView from './components/WeeklyReflection';
import { Habit, Mood, CoachMessage, WeeklyReflection, HabitLog } from './types';
import { TINY_HABITS } from './constants';
import { getCoachResponse } from './services/geminiService';

const Onboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const steps = [
    { title: "Start Tiny", text: "Big goals are scary. We start with habits so small they're impossible to fail.", icon: "🌱" },
    { title: "Stay Consistent", text: "Showing up is the only goal. Perfect is the enemy of consistent.", icon: "🔄" },
    { title: "Grow Slowly", text: "As your roots get stronger, your habits grow with you. Kind science works.", icon: "🌳" }
  ];

  return (
    <div className="fixed inset-0 z-[300] bg-white dark:bg-slate-900 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-8xl mb-8">{steps[step-1].icon}</div>
        <h2 className="text-4xl font-black text-slate-800 dark:text-slate-100 mb-4">{step}. {steps[step-1].title}</h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed mb-12">{steps[step-1].text}</p>
        <div className="flex gap-2 justify-center mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 w-1.5 rounded-full ${step === i + 1 ? 'bg-emerald-500 w-6' : 'bg-slate-200'} transition-all`} />
          ))}
        </div>
        <button 
          onClick={() => step === 3 ? onComplete() : setStep(step + 1)}
          className="w-full py-5 bg-emerald-600 text-white rounded-[24px] font-bold text-xl shadow-xl shadow-emerald-100 dark:shadow-none hover:bg-emerald-700 transition-all"
        >
          {step === 3 ? "Let's Start" : "Next Step"}
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toolView, setToolView] = useState<'timer' | 'library' | 'reflection'>('timer');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [reflections, setReflections] = useState<WeeklyReflection[]>([]);
  const [checkInHabit, setCheckInHabit] = useState<Habit | null>(null);
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('onboarded'));
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  
  // AI Coach State
  const [messages, setMessages] = useState<CoachMessage[]>([
    { role: 'coach', text: "Hello! I'm your Habit Coach. I believe in the power of tiny steps. What habit can I help you with today?", timestamp: Date.now() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Persistence
  useEffect(() => {
    const savedHabits = localStorage.getItem('habit_coach_habits');
    const savedRefs = localStorage.getItem('habit_coach_reflections');
    if (savedHabits) setHabits(JSON.parse(savedHabits));
    if (savedRefs) setReflections(JSON.parse(savedRefs));
  }, []);

  useEffect(() => {
    localStorage.setItem('habit_coach_habits', JSON.stringify(habits));
    localStorage.setItem('habit_coach_reflections', JSON.stringify(reflections));
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [habits, reflections, isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const confirmCheckIn = (habitId: string, mood: Mood, notes?: { win: string; learned: string }) => {
    const today = new Date().toISOString().split('T')[0];
    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        if (h.logs.some(l => l.date === today && l.completed)) return h;
        const log: HabitLog = { date: today, completed: true, mood, notes };
        const newStreak = h.streak + 1;
        return {
          ...h,
          logs: [...h.logs, log],
          streak: newStreak,
          bestStreak: Math.max(h.bestStreak, newStreak)
        };
      }
      return h;
    }));
    setCheckInHabit(null);
  };

  const addHabit = (name: string, goal: string, difficulty: 'tiny' | 'normal' | 'advanced', motivation?: string) => {
    // Overwhelm Shield: Max 3 habits
    if (habits.length >= 3) {
      alert("Overwhelm Shield Activated! Let's master your current 3 habits first. Simplicity wins.");
      return;
    }

    const newHabit: Habit = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      goal,
      motivation,
      time: '08:00',
      frequency: 'daily',
      difficulty,
      logs: [],
      streak: 0,
      bestStreak: 0,
      reminderShiftCount: 0
    };
    setHabits([...habits, newHabit]);
    setIsAddingHabit(false);
  };

  const handleRescue = (habit: Habit) => {
    setHabits(prev => prev.map(h => {
      if (h.id === habit.id) {
        return { ...h, difficulty: 'tiny', goal: `${h.goal} (Reduced for success)` };
      }
      return h;
    }));
    alert("Habit rescued! We've made it even smaller to help you get back on track effortlessly.");
  };

  const handleSaveReflection = (ref: Omit<WeeklyReflection, 'id' | 'weekStarting'>) => {
    const newRef: WeeklyReflection = {
      ...ref,
      id: Math.random().toString(36).substr(2, 9),
      weekStarting: new Date().toISOString()
    };
    setReflections([newRef, ...reflections]);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const userMsg: CoachMessage = { role: 'user', text: inputText, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    const response = await getCoachResponse(inputText, habits);
    setIsTyping(false);
    setMessages(prev => [...prev, { role: 'coach', text: response, timestamp: Date.now() }]);
  };

  const finishOnboarding = () => {
    localStorage.setItem('onboarded', 'true');
    setShowOnboarding(false);
  };

  if (showOnboarding) return <Onboarding onComplete={finishOnboarding} />;

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab} 
      isDarkMode={isDarkMode} 
      toggleDarkMode={toggleDarkMode}
    >
      {activeTab === 'dashboard' && (
        <div className="space-y-10 animate-in fade-in duration-700">
          <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-8 md:p-12 rounded-[40px] text-white shadow-2xl shadow-emerald-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Kind Habit Building</h2>
              <p className="text-emerald-100 opacity-90 text-lg">
                Habit Coach notices your effort. You have <span className="font-bold underline">{habits.filter(h => !h.logs.some(l => l.date === new Date().toISOString().split('T')[0])).length}</span> tiny habits left for today.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setIsLiveMode(true)} className="bg-white/20 hover:bg-white/30 text-white px-5 py-3 rounded-2xl font-bold text-xs transition-colors border border-white/30">🎙️ Live Mode</button>
              <button onClick={() => { setActiveTab('tools'); setToolView('timer'); }} className="bg-white/20 hover:bg-white/30 text-white px-5 py-3 rounded-2xl font-bold text-xs transition-colors border border-white/30">⏳ Timer</button>
              <button onClick={() => { setActiveTab('habits'); setIsAddingHabit(true); }} className="bg-white text-emerald-600 px-5 py-3 rounded-2xl font-bold text-xs shadow-lg hover:bg-emerald-50 transition-all">+ Add Habit</button>
            </div>
          </div>
          
          <Dashboard habits={habits} />
          
          <div className="pb-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">Habits We're Currently Observing</h3>
                {habits.length > 0 && (
                  <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">
                    ✓ Doing all of them
                  </span>
                )}
              </div>
              {habits.length > 0 && (
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  We are currently doing all of them
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {habits.map(habit => (
                <HabitCard key={habit.id} habit={habit} onCheckIn={setCheckInHabit} onRescue={handleRescue} />
              ))}
              {habits.length === 0 && (
                <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl">
                  <p className="text-slate-400 dark:text-slate-500 font-bold">No habits yet. Master 1-3 tiny steps first.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'habits' && (
        <div className="space-y-10 animate-in fade-in duration-700 pb-10">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">My Garden</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Nurturing {habits.length}/3 habits.</p>
            </div>
            <button onClick={() => setIsAddingHabit(true)} className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-100 dark:shadow-none hover:bg-emerald-600 transition-all">+ New Habit</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {habits.map(habit => (
              <HabitCard key={habit.id} habit={habit} onCheckIn={setCheckInHabit} onRescue={handleRescue} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'tools' && (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
          <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-fit mx-auto shadow-inner">
            <button onClick={() => setToolView('timer')} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${toolView === 'timer' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>Focus Timer</button>
            <button onClick={() => setToolView('library')} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${toolView === 'library' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>Library</button>
            <button onClick={() => setToolView('reflection')} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${toolView === 'reflection' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>Review</button>
          </div>
          <div className="pt-4">
            {toolView === 'timer' && <FocusTimer />}
            {toolView === 'library' && (
              <HabitLibrary 
                onAddHabit={addHabit} 
                onAddPlan={(plan) => {
                  plan.habits.forEach((h: any) => addHabit(h.name, h.goal, h.difficulty, `Part of ${plan.title} plan`));
                  alert(`${plan.title} plan added to your garden!`);
                }} 
              />
            )}
            {toolView === 'reflection' && <WeeklyReflectionView onSave={handleSaveReflection} history={reflections} />}
          </div>
        </div>
      )}

      {activeTab === 'coach' && (
        <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-700 bg-white dark:bg-slate-800 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-50 dark:border-slate-700 bg-emerald-50/30 dark:bg-emerald-900/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-2xl shadow-lg shadow-emerald-100 dark:shadow-none">✨</div>
              <div>
                <h2 className="font-bold text-slate-800 dark:text-slate-100">AI Coach</h2>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest">Personal Mentor</p>
              </div>
            </div>
            <button onClick={() => setIsLiveMode(true)} className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-200 transition-colors">🎙️ Go Live</button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'coach' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] md:max-w-[70%] p-6 rounded-[32px] text-base leading-relaxed ${m.role === 'coach' ? 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-tl-none border border-slate-100 dark:border-slate-700' : 'bg-emerald-500 text-white rounded-tr-none shadow-lg'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-[32px] rounded-tl-none flex gap-2 items-center"><div className="w-2 h-2 bg-emerald-300 rounded-full animate-bounce" /><div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-100" /><div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-200" /></div>
              </div>
            )}
          </div>
          <div className="p-6 md:p-10 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700">
            <div className="max-w-4xl mx-auto flex gap-4">
              <input value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Ask for advice..." className="flex-1 p-5 rounded-[24px] bg-white dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm text-base dark:text-slate-100 transition-all" />
              <button onClick={handleSendMessage} className="bg-emerald-500 text-white px-8 rounded-[24px] shadow-lg hover:bg-emerald-600 transition-all font-bold">Send</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-700 pt-10 pb-20">
          <div className="flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-[40px] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl mb-6 flex items-center justify-center text-6xl">🌿</div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Master Gardener</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Build. Grow. Repeat.</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-[40px] border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
            <button onClick={toggleDarkMode} className="w-full p-6 text-left flex items-center justify-between border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
              <div className="flex items-center gap-4"><span className="text-3xl bg-emerald-50 dark:bg-emerald-900 p-3 rounded-2xl">🌓</span><div><div className="text-base font-bold">Theme</div><div className="text-xs text-slate-500">Currently: {isDarkMode ? 'Dark' : 'Light'}</div></div></div>
            </button>
            <button className="w-full p-6 text-left flex items-center justify-between border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
              <div className="flex items-center gap-4"><span className="text-3xl bg-blue-50 dark:bg-blue-900 p-3 rounded-2xl">🔔</span><div><div className="text-base font-bold">Notifications</div><div className="text-xs text-slate-500">Adaptive timing enabled</div></div></div>
            </button>
          </div>
          <button onClick={() => { if(confirm("Reset everything?")) { localStorage.clear(); window.location.reload(); } }} className="w-full p-6 text-base font-bold text-red-500 bg-red-50 dark:bg-red-900/10 rounded-[24px] text-center hover:bg-red-100 transition-colors">Reset All Progress</button>
        </div>
      )}

      {checkInHabit && (
        <CheckInModal habit={checkInHabit} onClose={() => setCheckInHabit(null)} onConfirm={confirmCheckIn} />
      )}

      {isLiveMode && <LiveCoachOverlay habits={habits} onClose={() => setIsLiveMode(false)} />}

      {isAddingHabit && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[40px] p-8 md:p-12 overflow-y-auto max-h-[90vh] shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-bold dark:text-slate-100">Add New Habit</h2>
              <button onClick={() => setIsAddingHabit(false)} className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">✕</button>
            </div>
            
            <div className="space-y-12">
              <section>
                <div className="flex items-center justify-between mb-6 px-1">
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Popular Tiny Habits</h3>
                  <button 
                    onClick={() => { setActiveTab('tools'); setToolView('library'); setIsAddingHabit(false); }}
                    className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Browse full library
                  </button>
                </div>
                
                {/* Categorized Popular Habits */}
                <div className="space-y-6">
                   {['Health', 'Mind', 'Productivity'].map(cat => (
                     <div key={cat}>
                        <h4 className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-1">{cat}</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {TINY_HABITS.filter(h => h.category === cat).map(t => (
                            <button 
                              key={t.name}
                              onClick={() => addHabit(t.name, t.goal, 'tiny')}
                              className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 p-4 rounded-3xl text-left hover:border-emerald-500 dark:hover:border-emerald-500 transition-all group active:scale-95 shadow-sm"
                            >
                              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{t.icon}</div>
                              <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{t.name}</div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-1">{t.goal}</div>
                            </button>
                          ))}
                        </div>
                     </div>
                   ))}
                </div>
              </section>

              <section className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-4 mb-2 px-1">
                   <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Or Create Custom</h3>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  addHabit(
                    formData.get('name') as string, 
                    formData.get('goal') as string, 
                    formData.get('difficulty') as any,
                    formData.get('motivation') as string
                  );
                }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-2 ml-1">Habit Name</label>
                      <input name="name" required placeholder="e.g., Meditation" className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none text-sm dark:text-slate-100 transition-all" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-2 ml-1">Tiny Goal</label>
                      <input name="goal" required placeholder="e.g., 2 deep breaths" className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none text-sm dark:text-slate-100 transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-2 ml-1">Why is this important?</label>
                    <input name="motivation" placeholder="e.g., To feel more calm and present" className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none text-sm dark:text-slate-100 transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-2 ml-1">Difficulty Level</label>
                    <select name="difficulty" className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none text-sm dark:text-slate-100 appearance-none cursor-pointer transition-all">
                      <option value="tiny">Tiny (Quick & Easy)</option>
                      <option value="normal">Normal (Moderate Effort)</option>
                      <option value="advanced">Advanced (Commitment)</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full py-5 bg-emerald-500 text-white rounded-[24px] font-bold shadow-xl shadow-emerald-100 dark:shadow-none hover:bg-emerald-600 active:scale-95 transition-all text-lg">Plant This Habit</button>
                </form>
              </section>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
