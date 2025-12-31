
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { Habit } from '../types';

interface LiveCoachOverlayProps {
  onClose: () => void;
  habits: Habit[];
}

const LANGUAGES = [
  { name: 'English', code: 'en', icon: '🇺🇸' },
  { name: 'Español', code: 'es', icon: '🇪🇸' },
  { name: 'Français', code: 'fr', icon: '🇫🇷' },
  { name: 'Deutsch', code: 'de', icon: '🇩🇪' },
  { name: '日本語', code: 'ja', icon: '🇯🇵' },
  { name: '中文', code: 'zh', icon: '🇨🇳' },
];

// Manual implementation of decode as required by guidelines
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Manual implementation of encode as required by guidelines
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Custom audio decoding function for raw PCM data
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const LiveCoachOverlay: React.FC<LiveCoachOverlayProps> = ({ onClose, habits }) => {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error' | 'closed'>('connecting');
  const [transcription, setTranscription] = useState<string>('');
  const [userTranscription, setUserTranscription] = useState<string>('');
  const [currentLanguage, setCurrentLanguage] = useState(LANGUAGES[0]);
  
  const sessionRef = useRef<any>(null);
  const audioContextsRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Initialize GoogleGenAI with named parameter apiKey
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const habitsContext = habits.map(h => `${h.name}: ${h.goal} (Streak: ${h.streak})`).join(", ");
    const systemInstruction = `
      You are "Habit Coach", a supportive and kind AI mentor. 
      You are currently in a LIVE VOICE session with the user.
      LANGUAGE: Please speak primarily in ${currentLanguage.name}.
      Keep your responses concise, friendly, and encouraging.
      Always focus on "Tiny Habits" and progress over perfection.
      User's current habits: ${habitsContext}.
      If the user sounds stressed, suggest a smaller version of their goal.
      NEVER use guilt.
    `;

    const startSession = async () => {
      setStatus('connecting');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        audioContextsRef.current = { input: inputCtx, output: outputCtx };

        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
            },
            systemInstruction,
            outputAudioTranscription: {},
            inputAudioTranscription: {},
          },
          callbacks: {
            onopen: () => {
              setStatus('connected');
              const source = inputCtx.createMediaStreamSource(stream);
              const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
              
              scriptProcessor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const l = inputData.length;
                const int16 = new Int16Array(l);
                for (let i = 0; i < l; i++) {
                  int16[i] = inputData[i] * 32768;
                }
                const pcmBlob: Blob = {
                  data: encode(new Uint8Array(int16.buffer)),
                  mimeType: 'audio/pcm;rate=16000',
                };
                
                // Use sessionPromise.then to ensure session is resolved before sending data
                sessionPromise.then((session) => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              };

              source.connect(scriptProcessor);
              scriptProcessor.connect(inputCtx.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
              // Handle Transcriptions using .text property
              if (message.serverContent?.outputTranscription) {
                setTranscription(prev => prev + message.serverContent!.outputTranscription!.text);
              } else if (message.serverContent?.inputTranscription) {
                setUserTranscription(prev => prev + message.serverContent!.inputTranscription!.text);
              }

              if (message.serverContent?.turnComplete) {
                setTranscription('');
                setUserTranscription('');
              }

              // Handle Audio Output
              const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
              if (base64Audio && audioContextsRef.current) {
                const { output: ctx } = audioContextsRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                
                const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);
                
                source.addEventListener('ended', () => {
                  sourcesRef.current.delete(source);
                });

                // Schedule next audio chunk to start at exact end time of previous one
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
              }

              if (message.serverContent?.interrupted) {
                sourcesRef.current.forEach(s => s.stop());
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
              }
            },
            onerror: (e) => {
              console.error("Live API Error", e);
              setStatus('error');
            },
            onclose: () => {
              setStatus('closed');
            }
          }
        });

        sessionRef.current = await sessionPromise;
      } catch (err) {
        console.error("Failed to start Live session", err);
        setStatus('error');
      }
    };

    startSession();

    return () => {
      if (sessionRef.current) sessionRef.current.close();
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (audioContextsRef.current) {
        audioContextsRef.current.input.close();
        audioContextsRef.current.output.close();
      }
    };
  }, [currentLanguage, habits]);

  return (
    <div className="fixed inset-0 z-[200] bg-emerald-600/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-white animate-in fade-in duration-500">
      <div className="absolute top-8 left-8 flex items-center gap-2">
         <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">Language</div>
         <div className="flex bg-black/20 p-1 rounded-xl">
           {LANGUAGES.map(lang => (
             <button
               key={lang.code}
               onClick={() => setCurrentLanguage(lang)}
               className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                 currentLanguage.code === lang.code ? 'bg-white text-emerald-600 scale-110 shadow-lg' : 'opacity-40 hover:opacity-100'
               }`}
               title={lang.name}
             >
               {lang.icon}
             </button>
           ))}
         </div>
      </div>

      <div className="absolute top-8 right-8">
        <button onClick={onClose} className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-2xl">
          ✕
        </button>
      </div>

      <div className="flex flex-col items-center text-center space-y-12 max-w-2xl w-full">
        <div className="relative">
          <div className={`w-48 h-48 rounded-full bg-white/10 flex items-center justify-center transition-all duration-700 ${status === 'connected' ? 'scale-110 shadow-[0_0_80px_rgba(255,255,255,0.3)]' : 'scale-100'}`}>
            <div className={`w-32 h-32 rounded-full bg-white/20 flex items-center justify-center text-6xl animate-pulse`}>
              ✨
            </div>
          </div>
          {status === 'connected' && (
            <div className="absolute inset-0 border-4 border-white/30 rounded-full animate-ping" />
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl font-bold">
            {status === 'connecting' ? 'Switching Language...' : 
             status === 'connected' ? 'Listening...' : 
             status === 'error' ? 'Connection Error' : 'Session Closed'}
          </h2>
          <p className="text-emerald-100 text-lg opacity-80">
            Speaking in <span className="font-bold underline">{currentLanguage.name}</span>. I'm here to support your tiny steps.
          </p>
        </div>

        <div className="w-full bg-black/10 rounded-[40px] p-10 min-h-[200px] flex flex-col justify-center space-y-6">
          {userTranscription && (
             <div className="text-left">
               <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-200 block mb-2">You</span>
               <p className="text-xl font-medium italic opacity-70">"{userTranscription}"</p>
             </div>
          )}
          
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-200 block mb-2">Coach</span>
            <p className="text-2xl font-bold leading-relaxed">
              {transcription || (status === 'connected' ? "I'm listening, say hello!" : "...")}
            </p>
          </div>
        </div>

        {status === 'error' && (
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-white text-emerald-600 rounded-2xl font-bold shadow-xl"
          >
            Retry Connection
          </button>
        )}
      </div>
    </div>
  );
};

export default LiveCoachOverlay;
