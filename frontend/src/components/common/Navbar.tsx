import React, { useMemo } from 'react';
import { Sparkles, BrainCircuit, BookOpen, Compass, Zap, LayoutDashboard, Mic } from 'lucide-react';
import { getSessionIntroSlogan } from '../../services/slogans';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLaunchDemo: () => void;
  isBackendConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onLaunchDemo,
  isBackendConnected
}) => {
  // Compute dynamic intro slogan once per website visit/refresh
  const introSlogan = useMemo(() => getSessionIntroSlogan(), []);

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-violet-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center overflow-hidden">
              <img src="/mentor_avatar.jpg" alt="KISHORE AI Mentor" className="w-full h-full object-cover object-top" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                KISHORE AI Mentor
              </span>
              <span className="text-[10px] uppercase font-extrabold tracking-wider bg-indigo-500/20 text-cyan-300 border border-indigo-500/30 px-1.5 py-0.5 rounded-full">
                Voice Agent
              </span>
            </div>
            {/* Dynamic Rotating Intro Line */}
            <p className="text-[11px] text-cyan-400 font-semibold hidden sm:flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
              <span>{introSlogan}</span>
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Workspace
          </button>

          <button
            onClick={() => setActiveTab('voice_agent')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'voice_agent'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            Real-Time Voice Call
          </button>

          <button
            onClick={() => setActiveTab('setup')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'setup'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Curriculum Studio
          </button>

          <button
            onClick={() => setActiveTab('progress')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'progress'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Learning DNA
          </button>
        </nav>

        {/* Action Button & Health Status */}
        <div className="flex items-center gap-3">
          <button
            onClick={onLaunchDemo}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all"
            title="Start Real-Time Voice Call with KISHORE AI Mentor"
          >
            <Mic className="w-3.5 h-3.5 fill-current" />
            <span>⚡ Start Voice Call</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs">
            <span className={`w-2 h-2 rounded-full animate-pulse ${
              isBackendConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400'
            }`} />
            <span className="text-slate-300 text-[11px] font-medium hidden sm:inline">
              Voice Agent Ready
            </span>
          </div>
        </div>

      </div>
    </header>
  );
};
