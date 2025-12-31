
export const TINY_HABITS = [
  { name: "Hydrate", goal: "Drink one glass of water", icon: "💧", category: "Health" },
  { name: "Read", goal: "Read 2 pages of a book", icon: "📖", category: "Mind" },
  { name: "Move", goal: "Walk for 5 minutes", icon: "🚶", category: "Health" },
  { name: "Mindfulness", goal: "One minute of deep breathing", icon: "🧘", category: "Mind" },
  { name: "Tidy", goal: "Put away 3 items in a room", icon: "✨", category: "Productivity" },
  { name: "Journal", goal: "Write one sentence about today", icon: "✍️", category: "Mind" },
];

export const SCIENCE_TIPS = [
  "Habits stick faster when you attach them to another existing habit (Habit Stacking).",
  "Tiny steps every day > big effort once a week. Your brain loves easy wins.",
  "Your environment dictates your behavior. Place visual cues where you'll see them.",
  "Missing one day doesn't ruin a habit. Missing two is the start of a new one.",
  "The 'Goldilocks Zone' of habits: Not too easy to be boring, not too hard to be scary.",
  "Motivation is a wave; systems are the surfboard. Build the system first."
];

export const BARRIER_SOLUTIONS: Record<string, string> = {
  'forgot': "Try a sticky note on your mirror or a phone wallpaper reminder!",
  'no-time': "Can you do a 'Nano' version? 30 seconds is better than zero.",
  'tired': "Do the '2-Minute Version'—just start, and you can stop after 120 seconds.",
  'not-feeling-it': "Focus on how you'll feel *after* you've done it, even for a moment."
};

export const HABIT_PLANS = [
  {
    id: "sleep",
    title: "Better Sleep",
    description: "Wind down and wake up refreshed.",
    habits: [
      { name: "No Screens", goal: "Turn off phone 15m before bed", difficulty: "tiny" },
      { name: "Morning Light", goal: "Step outside for 2m after waking", difficulty: "tiny" }
    ],
    icon: "🌙"
  },
  {
    id: "focus",
    title: "Study Focus",
    description: "Deep work for busy minds.",
    habits: [
      { name: "Clear Desk", goal: "Remove 1 distraction from desk", difficulty: "tiny" },
      { name: "Focus Block", goal: "Set a 10m timer for one task", difficulty: "tiny" }
    ],
    icon: "🧠"
  },
  {
    id: "fitness",
    title: "Fitness Starter",
    description: "Start moving without the gym fear.",
    habits: [
      { name: "Squats", goal: "Do 5 squats while brushing teeth", difficulty: "tiny" },
      { name: "Stretch", goal: "One child's pose stretch", difficulty: "tiny" }
    ],
    icon: "💪"
  }
];

export const HABIT_LIBRARY = [
  { 
    category: "Health",
    habits: [
      { name: "Water", goal: "Drink water before coffee", icon: "💧" },
      { name: "Sunlight", goal: "2 minutes of morning sun", icon: "☀️" },
      { name: "Posture", goal: "One shoulder roll every hour", icon: "🧍" }
    ]
  },
  {
    category: "Productivity",
    habits: [
      { name: "Inbox", goal: "Archive 5 old emails", icon: "📧" },
      { name: "Priority", goal: "Write down top 1 task", icon: "📝" },
      { name: "Desktop", goal: "Close unused browser tabs", icon: "💻" }
    ]
  },
  {
    category: "Mind",
    habits: [
      { name: "Gratitude", goal: "Name 1 thing I'm thankful for", icon: "🙏" },
      { name: "Breathing", goal: "3 deep belly breaths", icon: "🌬️" },
      { name: "Observation", goal: "Notice 1 beautiful thing outside", icon: "🌸" }
    ]
  }
];
