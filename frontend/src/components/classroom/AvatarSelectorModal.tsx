import React from 'react';
import { User, Sparkles, Check, X, ShieldCheck, Zap, Code, Brain, Compass, Cpu } from 'lucide-react';

export interface AvatarPreset {
  id: 'kishore' | 'sophia' | 'alex' | 'marcus' | 'cyber_bot' | 'custom';
  name: string;
  role: string;
  description: string;
  tag: string;
  icon: any;
  color: string;
  badgeBg: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 'kishore',
    name: 'KISHORE AI Mentor',
    role: 'Lead AI Educator & Academic Mentor',
    description: 'Empathetic, first-principles tutoring across Computer Science, Engineering, and General Subjects with navy tailored suit.',
    tag: 'Academic Cyber Mentor (Half-Body 3D)',
    icon: Sparkles,
    color: 'from-cyan-500 to-indigo-500',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
  },
  {
    id: 'sophia',
    name: 'Sophia AI',
    role: 'Quantum & Deep Tech Science Specialist',
    description: 'Intuitive visual breakdowns of Complex Physics, Biology, Chemistry, and Quantum Mechanics.',
    tag: 'Deep Tech & Science Tutor',
    icon: Brain,
    color: 'from-emerald-500 to-teal-500',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  },
  {
    id: 'alex',
    name: 'Alex AI',
    role: 'Full-Stack Systems & Coding Specialist',
    description: 'Live interactive code call stack walkthroughs, Python OOP, System Architecture, and Algorithms.',
    tag: 'Code & Architecture Specialist',
    icon: Code,
    color: 'from-green-500 to-emerald-600',
    badgeBg: 'bg-green-500/20 text-green-300 border-green-500/30'
  },
  {
    id: 'marcus',
    name: 'Marcus AI',
    role: 'Theoretical Mathematics & Logic Specialist',
    description: 'Step-by-step calculus proofs, linear algebra, discrete math, and probability intuition.',
    tag: 'Math & Theoretical Logic',
    icon: Compass,
    color: 'from-purple-500 to-violet-600',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  },
  {
    id: 'cyber_bot',
    name: 'Titan-X Cyber Android',
    role: 'Futuristic Holographic AI Assistant',
    description: 'State-of-the-art metallic WebGL android persona with glowing neon neural particle field.',
    tag: 'Cyber Hologram Avatar',
    icon: Cpu,
    color: 'from-cyan-400 to-blue-600',
    badgeBg: 'bg-cyan-400/20 text-cyan-200 border-cyan-400/30'
  }
];

interface AvatarSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAvatarId: string;
  onSelectAvatar: (presetId: 'kishore' | 'sophia' | 'alex' | 'marcus' | 'cyber_bot' | 'custom') => void;
}

export const AvatarSelectorModal: React.FC<AvatarSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedAvatarId,
  onSelectAvatar
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-5 overflow-hidden">
        
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              100% Free 3D Avatar Studio
            </div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <span>Choose Your 3D AI Mentor Persona</span>
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Persona Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[60vh] overflow-y-auto pr-1">
          {AVATAR_PRESETS.map((preset) => {
            const isSelected = selectedAvatarId === preset.id;
            const Icon = preset.icon;

            return (
              <div
                key={preset.id}
                onClick={() => {
                  onSelectAvatar(preset.id);
                  onClose();
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-slate-900/90 border-cyan-400/80 shadow-lg shadow-cyan-500/20 scale-[1.02] ring-2 ring-cyan-400/50'
                    : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                {/* Selected Indicator Checkmark */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`p-2 rounded-xl bg-gradient-to-tr ${preset.color} text-slate-950 shadow-md`}>
                      <Icon className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{preset.name}</span>
                      </h3>
                      <span className={`text-[9px] uppercase font-extrabold px-2 py-0.2 rounded-full border ${preset.badgeBg}`}>
                        {preset.tag}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mt-2">
                    {preset.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
                  <span className="font-medium text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    100% Free 3D Model
                  </span>
                  <span className={`font-bold ${isSelected ? 'text-cyan-300' : 'text-slate-500'}`}>
                    {isSelected ? 'Active Persona' : 'Select Avatar →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Note */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 text-[11px]">
            ⚡ Switch anytime during your voice call.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-transform"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
