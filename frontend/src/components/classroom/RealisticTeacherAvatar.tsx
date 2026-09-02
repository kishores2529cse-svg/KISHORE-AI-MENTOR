import React, { useState } from 'react';
import { Volume2, VolumeX, Radio, Sparkles, Activity, ShieldCheck, Orbit } from 'lucide-react';
import { Avatar3D } from './Avatar3D';

interface RealisticTeacherAvatarProps {
  spokenText: string;
  isSpeaking: boolean;
  emotion?: string;
  speechEnabled: boolean;
  onToggleSpeech: () => void;
  topic?: string;
}

export const RealisticTeacherAvatar: React.FC<RealisticTeacherAvatarProps> = ({
  spokenText,
  isSpeaking,
  emotion = 'Elucidating',
  speechEnabled,
  onToggleSpeech,
  topic = 'Live Session'
}) => {
  const [avatarMode, setAvatarMode] = useState<'3d' | 'photo'>('3d');
  const agentState = isSpeaking ? 'speaking' : 'idle';

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-indigo-500/30 flex flex-col justify-between h-full relative overflow-hidden shadow-2xl">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Video Header HUD */}
      <div className="flex items-center justify-between z-10 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE • KISHORE S</span>
          </div>

          {/* 3D vs Photo Avatar Toggle */}
          <div className="flex items-center bg-slate-900/90 p-0.5 rounded-full border border-slate-800 shadow-inner">
            <button
              type="button"
              onClick={() => setAvatarMode('3d')}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                avatarMode === '3d'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ⚡ 3D
            </button>
            <button
              type="button"
              onClick={() => setAvatarMode('photo')}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                avatarMode === 'photo'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              👤 Photo
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full bg-indigo-500/20 text-cyan-300 border border-indigo-500/40 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            {emotion}
          </span>

          <button
            onClick={onToggleSpeech}
            className={`p-1.5 rounded-lg border transition-all ${
              speechEnabled
                ? 'bg-indigo-600/30 border-cyan-400 text-cyan-300 shadow-md shadow-indigo-500/20'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title={speechEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}
          >
            {speechEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Avatar Video Frame */}
      <div className="relative my-auto py-2 flex flex-col items-center justify-center z-10 w-full">
        
        {/* Glow border ring when mentor is speaking */}
        <div className={`relative rounded-2xl p-1 transition-all duration-500 w-52 h-52 sm:w-60 sm:h-60 ${
          isSpeaking 
            ? 'ring-4 ring-cyan-400/60 shadow-[0_0_40px_rgba(56,189,248,0.35)]' 
            : 'ring-1 ring-slate-700/80 shadow-xl'
        }`}>
          
          {avatarMode === '3d' ? (
            <Avatar3D
              agentState={agentState}
              spokenText={spokenText}
              isAudioMuted={!speechEnabled}
            />
          ) : (
            <div className="w-full h-full rounded-xl overflow-hidden bg-slate-950 relative">
              <img
                src="/mentor_avatar.jpg"
                alt="Kishore S - AI Mentor"
                className="w-full h-full object-cover object-top transition-transform duration-300"
                style={{ transform: isSpeaking ? 'scale(1.03)' : 'scale(1)' }}
                onError={(e: any) => {
                  e.target.src = '/mentor_avatar.png';
                }}
              />

              {/* Speaking audio waveform overlay */}
              {isSpeaking && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-950/80 px-3 py-1 rounded-full border border-cyan-400/50 backdrop-blur-sm">
                  <span className="w-1 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-2.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="w-1 h-4 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
                  <span className="text-[10px] font-bold text-cyan-300 ml-1">Speaking...</span>
                </div>
              )}
            </div>
          )}

          {/* Verification Badge */}
          <div className="absolute -bottom-2 -right-2 bg-slate-900 border border-indigo-500/40 rounded-full p-1 shadow-md z-20">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
          </div>
        </div>

        {/* Mentor Title & Topic */}
        <div className="mt-3 text-center">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center justify-center gap-1.5">
            <span>Kishore S</span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-semibold">
              {avatarMode === '3d' ? '3D AI Avatar' : 'AI Mentor'}
            </span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs truncate">
            {topic}
          </p>
        </div>

      </div>

      {/* Spoken Voice Subtitles Box */}
      <div className="mt-2 p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-200 leading-relaxed max-h-32 overflow-y-auto z-10">
        <div className="flex items-center justify-between text-indigo-400 font-bold text-[10px] uppercase mb-1">
          <span className="flex items-center gap-1">
            <Radio className="w-3 h-3 text-cyan-400" />
            Mentor Spoken Audio Stream
          </span>
          {isSpeaking && <span className="text-cyan-400 animate-pulse">Voice Active</span>}
        </div>
        <p className="italic text-slate-300">
          "{spokenText || "Hello! I'm Kishore S, your AI Mentor. Upload your study material or ask me anything—I'm here to elucidate the concepts step-by-step so you deeply understand rather than memorize!"}"
        </p>
      </div>

    </div>
  );
};
