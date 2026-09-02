import React, { useMemo } from 'react';
import { Sparkles, Mic, ChevronLeft, ChevronRight } from 'lucide-react';
import { getSessionIntroSlogan } from '../../services/slogans';
import { PillNav, PillNavItem } from './PillNav';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLaunchDemo: () => void;
  isBackendConnected: boolean;
  onGoBack?: () => void;
  onGoNext?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onLaunchDemo,
  isBackendConnected,
  onGoBack,
  onGoNext
}) => {
  const introSlogan = useMemo(() => getSessionIntroSlogan(), []);

  const pageOrder = ['landing', 'dashboard', 'voice_agent', 'setup', 'progress'];
  const currentIndex = pageOrder.indexOf(activeTab);
  const isLandingPage = activeTab === 'landing';

  const navItems: PillNavItem[] = [
    { label: 'Home', href: 'landing' },
    { label: 'Workspace', href: 'dashboard' },
    { label: 'Voice Call', href: 'voice_agent' },
    { label: 'Curriculum', href: 'setup' },
    { label: 'Learning DNA', href: 'progress' }
  ];

  const handleBack = () => {
    if (onGoBack) {
      onGoBack();
    } else if (currentIndex > 0) {
      setActiveTab(pageOrder[currentIndex - 1]);
    } else {
      setActiveTab('landing');
    }
  };

  const handleNext = () => {
    if (onGoNext) {
      onGoNext();
    } else if (currentIndex < pageOrder.length - 1) {
      setActiveTab(pageOrder[currentIndex + 1]);
    } else {
      setActiveTab('dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-3 sm:px-6 lg:px-8 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Left Side: Metallic Back Button (when not on landing) + Brand Info */}
        <div className="flex items-center gap-3">
          {!isLandingPage && (
            <button
              onClick={handleBack}
              type="button"
              title="Previous Page / Return to Landing"
              className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                         bg-gradient-to-b from-[#2e313a] via-[#1a1c23] to-[#0e1015]
                         border border-neutral-400/60 hover:border-white
                         text-neutral-200 hover:text-white
                         shadow-[0_4px_12px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.5),inset_0_-1px_1px_rgba(0,0,0,0.8)]
                         hover:shadow-[0_0_20px_rgba(255,255,255,0.35),inset_0_1px_2px_rgba(255,255,255,0.7)]
                         backdrop-blur-xl transition-all duration-300 ease-out hover:scale-105 active:scale-95 cursor-pointer"
            >
              <div className="w-5 h-5 rounded-lg bg-neutral-900/90 border border-neutral-700/80 flex items-center justify-center group-hover:border-neutral-300 transition-colors shadow-inner">
                <ChevronLeft className="w-3.5 h-3.5 text-neutral-300 group-hover:text-white transition-transform group-hover:-translate-x-0.5" />
              </div>
              <span className="font-semibold text-xs tracking-wider bg-gradient-to-r from-neutral-100 to-neutral-300 bg-clip-text text-transparent group-hover:from-white group-hover:to-white hidden sm:inline">
                Back
              </span>
            </button>
          )}

          {/* Brand Details */}
          <div 
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-2.5 cursor-pointer group"
            title="Go to Landing Page"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                  KISHORE AI Mentor
                </span>
                <span className="text-[9px] uppercase font-extrabold tracking-wider bg-indigo-500/20 text-cyan-300 border border-indigo-500/30 px-1.5 py-0.5 rounded-full">
                  Voice Agent
                </span>
              </div>
              <p className="text-[10px] text-cyan-400 font-semibold hidden xl:flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
                <span>{introSlogan}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Center: React Bits GSAP-Animated PillNav */}
        <div className="flex items-center justify-center">
          <PillNav
            logo="/mentor_avatar.jpg"
            logoAlt="KISHORE AI Mentor"
            items={navItems}
            activeHref={activeTab}
            onItemClick={(href) => setActiveTab(href)}
            baseColor="#080c16"
            pillColor="#111827"
            pillTextColor="#94a3b8"
            hoveredPillTextColor="#ffffff"
            ease="power2.easeOut"
            initialLoadAnimation={true}
          />
        </div>

        {/* Right Side: Start Voice Call + Health Status + Metallic Next Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onLaunchDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all"
            title="Start Real-Time Voice Call with KISHORE AI Mentor"
          >
            <Mic className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Start Voice Call</span>
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs hidden sm:flex">
            <span className={`w-2 h-2 rounded-full animate-pulse ${
              isBackendConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400'
            }`} />
            <span className="text-slate-300 text-[10px] font-medium hidden md:inline">
              Ready
            </span>
          </div>

          {!isLandingPage && (
            <button
              onClick={handleNext}
              type="button"
              title="Next Page / Advance"
              className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                         bg-gradient-to-b from-[#2e313a] via-[#1a1c23] to-[#0e1015]
                         border border-neutral-400/60 hover:border-white
                         text-neutral-200 hover:text-white
                         shadow-[0_4px_12px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.5),inset_0_-1px_1px_rgba(0,0,0,0.8)]
                         hover:shadow-[0_0_20px_rgba(255,255,255,0.35),inset_0_1px_2px_rgba(255,255,255,0.7)]
                         backdrop-blur-xl transition-all duration-300 ease-out hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span className="font-semibold text-xs tracking-wider bg-gradient-to-r from-neutral-100 to-neutral-300 bg-clip-text text-transparent group-hover:from-white group-hover:to-white hidden sm:inline">
                Next
              </span>
              <div className="w-5 h-5 rounded-lg bg-neutral-900/90 border border-neutral-700/80 flex items-center justify-center group-hover:border-neutral-300 transition-colors shadow-inner">
                <ChevronRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
