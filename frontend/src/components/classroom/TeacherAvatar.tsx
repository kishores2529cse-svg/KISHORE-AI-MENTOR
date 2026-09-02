import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Sparkles, Brain, Radio } from 'lucide-react';

interface TeacherAvatarProps {
  spokenText: string;
  isSpeaking: boolean;
  emotion: 'explaining' | 'encouraging' | 'diagnostic' | 'misconception' | 'celebrating';
  teachingStyle: string;
  onToggleSpeech: () => void;
  speechEnabled: boolean;
}

export const TeacherAvatar: React.FC<TeacherAvatarProps> = ({
  spokenText,
  isSpeaking,
  emotion,
  teachingStyle,
  onToggleSpeech,
  speechEnabled
}) => {
  const [mouthOpen, setMouthOpen] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isSpeaking) {
      interval = setInterval(() => {
        setMouthOpen(prev => !prev);
      }, 180);
    } else {
      setMouthOpen(false);
    }
    return () => clearInterval(interval);
  }, [isSpeaking]);

  const emotionGlow = {
    explaining: 'from-cyan-500/20 to-indigo-500/20 border-cyan-500/30 text-cyan-300',
    encouraging: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300',
    diagnostic: 'from-indigo-500/20 to-violet-500/20 border-indigo-500/30 text-indigo-300',
    misconception: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300',
    celebrating: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-pink-300'
  }[emotion] || 'from-indigo-500/20 to-cyan-500/20 border-indigo-500/30 text-cyan-300';

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col justify-between h-full">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute inset-0 animate-ping opacity-75" />
          </div>
          <span className="text-xs font-bold text-white">
            KISHORE S AI Teacher
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full border bg-gradient-to-r ${emotionGlow}`}>
            {emotion}
          </span>
          <button
            onClick={onToggleSpeech}
            className={`p-1.5 rounded-lg border transition-colors ${
              speechEnabled
                ? 'bg-indigo-600/30 border-indigo-500 text-cyan-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title={speechEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}
          >
            {speechEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Animated Teacher Avatar SVG Presence */}
      <div className="relative my-auto py-4 flex flex-col items-center justify-center">
        {/* Glow halo */}
        <div className={`absolute w-36 h-36 rounded-full bg-gradient-to-tr ${emotionGlow} blur-2xl pointer-events-none opacity-60`} />

        <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-950 border-2 border-indigo-500/40 p-2 shadow-xl flex items-center justify-center">
          
          {/* Avatar Face Graphic */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>

            {/* Head Silhouette */}
            <rect x="20" y="20" width="60" height="60" rx="16" fill="#0f172a" stroke="url(#skinGrad)" strokeWidth="2.5" />
            
            {/* Eyes */}
            <circle cx="38" cy="44" r="5" fill="#38bdf8" className={isSpeaking ? "animate-pulse" : ""} />
            <circle cx="62" cy="44" r="5" fill="#38bdf8" className={isSpeaking ? "animate-pulse" : ""} />
            <circle cx="39" cy="43" r="1.5" fill="#ffffff" />
            <circle cx="63" cy="43" r="1.5" fill="#ffffff" />

            {/* Eyebrows based on emotion */}
            {emotion === 'misconception' ? (
              <>
                <line x1="33" y1="36" x2="43" y2="38" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
                <line x1="57" y1="38" x2="67" y2="36" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
              </>
            ) : (
              <>
                <line x1="33" y1="37" x2="43" y2="37" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
                <line x1="57" y1="37" x2="67" y2="37" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
              </>
            )}

            {/* Nose */}
            <path d="M50 48 L48 54 L52 54" stroke="#64748b" strokeWidth="1.5" fill="none" strokeLinecap="round" />

            {/* Dynamic Mouth */}
            {isSpeaking ? (
              mouthOpen ? (
                <ellipse cx="50" cy="64" rx="9" ry="6" fill="#f43f5e" stroke="#fda4af" strokeWidth="1" />
              ) : (
                <line x1="42" y1="64" x2="58" y2="64" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
              )
            ) : emotion === 'encouraging' || emotion === 'celebrating' ? (
              <path d="M42 62 Q50 68 58 62" stroke="#34d399" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            ) : (
              <line x1="44" y1="64" x2="56" y2="64" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            )}

            {/* Teacher Headset / Antenna */}
            <path d="M20 50 A30 30 0 0 1 80 50" stroke="#818cf8" strokeWidth="2" fill="none" strokeDasharray="3 3" />
            <circle cx="20" cy="50" r="4" fill="#818cf8" />
            <circle cx="80" cy="50" r="4" fill="#818cf8" />
            <path d="M80 50 L75 62 L66 64" stroke="#818cf8" strokeWidth="2" fill="none" strokeLinecap="round" />
            <circle cx="65" cy="64" r="2.5" fill="#38bdf8" />
          </svg>

          {/* Speaking Audio Wave Indicator */}
          {isSpeaking && (
            <div className="absolute -bottom-2 flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-full border border-cyan-500/40">
              <span className="w-1 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-4 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>

        <div className="mt-3 text-center">
          <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <Radio className="w-3 h-3 text-indigo-400" />
            Strategy: <strong className="text-slate-200">{teachingStyle}</strong>
          </span>
        </div>
      </div>

      {/* Spoken Subtitles Card */}
      <div className="mt-2 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 leading-relaxed max-h-36 overflow-y-auto">
        <span className="text-indigo-400 font-bold block text-[10px] uppercase mb-1">
          Teacher Voice Speech:
        </span>
        <p className="italic">
          "{spokenText || 'Hello! I am preparing your adaptive pedagogical explanation...'}"
        </p>
      </div>

    </div>
  );
};
