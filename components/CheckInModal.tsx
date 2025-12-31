
import React, { useState } from 'react';
import { Habit, Mood } from '../types';

interface CheckInModalProps {
  habit: Habit;
  onClose: () => void;
  onConfirm: (habitId: string, mood: Mood, notes?: { win: string; learned: string }) => void;
}

const CheckInModal: React.FC<CheckInModalProps> = ({ habit, onClose, onConfirm }) => {
  const [selectedMood, setSelectedMood] = useState<Mood>('none');
  const [showNotes, setShowNotes] = useState(false);
  const [win, setWin] = useState('');
  const [learned, setLearned] = useState('');

  const moods: { type: Mood; emoji: string; label: string }[] = [
    { type: 'happy', emoji: '😊', label: 'Great' },
    { type: 'okay', emoji: '😐', label: 'Okay' },
    { type: 'stressed', emoji: '😫', label: 'Stressed' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[32px] md:rounded-[40px] p-8 md:p-10 shadow-2xl animate-in fade-in zoom-in-95 md:slide-in-from-none slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        <div className="hidden md:block w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-[24px] flex items-center justify-center text-3xl mb-6 mx-auto">🌱</div>
        <div className="md:hidden w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6" />
        
        <div className="text-center md:text-left mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">{habit.name}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Small progress is still progress. How are you feeling?</p>
        </div>
        
        <div className="grid grid-cols-3 gap-3 mb-8">
          {moods.map((m) => (
            <button
              key={m.type}
              onClick={() => setSelectedMood(m.type)}
              className={`flex flex-col items-center p-4 rounded-[24px] border-2 transition-all ${
                selectedMood === m.type 
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-md shadow-emerald-50 dark:shadow-none' 
                : 'border-slate-50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/50 hover:border-slate-200 dark:hover:border-slate-600'
              }`}
            >
              <span className="text-3xl mb-2">{m.emoji}</span>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">{m.label}</span>
            </button>
          ))}
        </div>

        {!showNotes ? (
          <button 
            onClick={() => setShowNotes(true)}
            className="w-full py-3 mb-8 text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-emerald-500 transition-colors flex items-center justify-center gap-2"
          >
            <span>+ Add a note about today?</span>
          </button>
        ) : (
          <div className="space-y-4 mb-8 animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase ml-2 mb-1 block">One small win</label>
              <input 
                value={win}
                onChange={(e) => setWin(e.target.value)}
                placeholder="What went well?" 
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-700 border-none outline-none text-sm dark:text-slate-100"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase ml-2 mb-1 block">What I learned</label>
              <input 
                value={learned}
                onChange={(e) => setLearned(e.target.value)}
                placeholder="Any realizations?" 
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-700 border-none outline-none text-sm dark:text-slate-100"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-[24px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors order-2 sm:order-1"
          >
            Close
          </button>
          <button
            onClick={() => onConfirm(habit.id, selectedMood, showNotes ? { win, learned } : undefined)}
            className="flex-[2] py-4 rounded-[24px] font-bold text-white bg-emerald-500 shadow-xl shadow-emerald-100 dark:shadow-none hover:bg-emerald-600 transition-all order-1 sm:order-2 text-lg"
          >
            Done for today
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckInModal;
