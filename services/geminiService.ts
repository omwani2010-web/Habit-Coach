
import { GoogleGenAI, Type } from "@google/genai";
import { Habit } from "../types";

// Always initialize with the direct process.env.API_KEY string
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are "Habit Coach", a supportive and kind AI mentor. 
Your goal is to help users build consistency through "Tiny Habits".
RULES:
1. Never use guilt or shaming.
2. If a user misses a day, encourage them and suggest an even smaller version of the habit (e.g., "instead of 20 mins, just 1 min today").
3. Be short, friendly, and respectful.
4. Focus on progress over perfection.
5. Do not make medical claims.
`;

export const getCoachResponse = async (userMessage: string, contextHabits: Habit[]) => {
  const habitsContext = contextHabits.map(h => `${h.name}: ${h.goal} (Difficulty: ${h.difficulty}, Current Streak: ${h.streak})`).join(", ");
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Context: User's current habits: ${habitsContext}. User says: ${userMessage}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    // Access the .text property directly
    return response.text || "I'm here to support you! Let's keep moving forward one tiny step at a time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having a little trouble connecting, but remember: you're doing great just by showing up!";
  }
};

export const suggestHabitImprovement = async (habit: Habit) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest a "tiny" version and a "positive encouragement" for this habit: ${habit.name} with goal ${habit.goal}.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tinyGoal: { type: Type.STRING },
            encouragement: { type: Type.STRING }
          },
          required: ["tinyGoal", "encouragement"]
        }
      },
    });
    // Use .text property and trim for cleaner JSON parsing
    const jsonStr = response.text?.trim() || "{}";
    return JSON.parse(jsonStr);
  } catch (error) {
    return { tinyGoal: habit.goal, encouragement: "You got this!" };
  }
};
