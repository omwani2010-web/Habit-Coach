
export type Difficulty = 'tiny' | 'normal' | 'advanced';
export type Mood = 'happy' | 'okay' | 'stressed' | 'none';

export interface HabitLog {
  date: string; // ISO Date
  completed: boolean;
  mood: Mood;
  notes?: {
    win: string;
    learned: string;
  };
}

export interface Habit {
  id: string;
  name: string;
  goal: string;
  motivation?: string; // "Why is this important?"
  time: string; // e.g., "08:00"
  frequency: 'daily' | 'weekly';
  difficulty: Difficulty;
  logs: HabitLog[];
  streak: number;
  bestStreak: number;
  reminderShiftCount: number;
  isPaused?: boolean;
}

export interface WeeklyReflection {
  id: string;
  weekStarting: string;
  answers: {
    q1: string; // What went well?
    q2: string; // What was the biggest challenge?
    q3: string; // One tiny improvement for next week?
  };
}

export interface CoachMessage {
  role: 'coach' | 'user';
  text: string;
  timestamp: number;
}
