import React, { useEffect, useRef } from 'react';
import { MagicRings } from './MagicRings';

interface LandingPageProps {
  onStartLearning: () => void;
  onUploadMaterial?: () => void;
  onLaunchDemo?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartLearning,
}) => {
  const hasSpokenOnThisMountRef = useRef(false);

  // Cinematic Welcome Voice Note:
  // "Welcome to KISHORE AI MENTOR — The Future of Learning is Here."
  useEffect(() => {
    let cancelTimer: any = null;

    const playCinematicWelcome = () => {
      if (hasSpokenOnThisMountRef.current) return;
      if (!('speechSynthesis' in window)) return;

      const speakWithNaturalPacing = () => {
        if (hasSpokenOnThisMountRef.current) return;
        window.speechSynthesis.cancel();

        const voices = window.speechSynthesis.getVoices();
        // Target natural American English tone (Christopher / Guy / David / Natural US English)
        const americanVoice = voices.find(v => 
          (v.name.toLowerCase().includes('christopher') || 
           v.name.toLowerCase().includes('guy') || 
           v.name.toLowerCase().includes('natural') || 
           v.name.toLowerCase().includes('david') || 
           v.name.toLowerCase().includes('aria')) && 
          v.lang.startsWith('en-US')
        ) || voices.find(v => v.lang === 'en-US') || voices.find(v => v.lang.startsWith('en'));

        // Part 1: "Welcome to KISHORE AI MENTOR"
        const part1 = new SpeechSynthesisUtterance("Welcome to KISHORE AI MENTOR.");
        part1.rate = 0.96;
        part1.pitch = 0.96;
        if (americanVoice) part1.voice = americanVoice;

        // Part 2: "The Future of Learning is Here."
        const part2 = new SpeechSynthesisUtterance("The future of learning is here.");
        part2.rate = 0.92;
        part2.pitch = 0.94;
        if (americanVoice) part2.voice = americanVoice;

        part1.onstart = () => {
          hasSpokenOnThisMountRef.current = true;
        };

        // When part 1 finishes, add a smooth 220ms dramatic pause before delivering the tagline
        part1.onend = () => {
          cancelTimer = setTimeout(() => {
            if (window.speechSynthesis) {
              window.speechSynthesis.speak(part2);
            }
          }, 220);
        };

        window.speechSynthesis.speak(part1);
      };

      if (window.speechSynthesis.getVoices().length > 0) {
        speakWithNaturalPacing();
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          speakWithNaturalPacing();
        };
      }
    };

    // Trigger shortly after landing page loads + fallback on first interaction
    const initTimer = setTimeout(playCinematicWelcome, 450);
    const handleFirstClick = () => {
      playCinematicWelcome();
      window.removeEventListener('click', handleFirstClick);
    };
    window.addEventListener('click', handleFirstClick);

    return () => {
      clearTimeout(initTimer);
      if (cancelTimer) clearTimeout(cancelTimer);
      window.removeEventListener('click', handleFirstClick);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-64px)] min-h-[560px] bg-[#030712] overflow-hidden select-none flex items-center justify-center">
      
      {/* 1. Full-Screen Interactive Magic Rings */}
      <MagicRings
        color="#A855F7"
        colorTwo="#00f2fe"
        ringCount={6}
        speed={1.6}
        attenuation={9}
        lineThickness={2.2}
        baseRadius={0.28}
        radiusStep={0.1}
        scaleRate={0.1}
        opacity={1}
        blur={0}
        noiseAmount={0.08}
        rotation={0}
        ringGap={1.5}
        fadeIn={0.7}
        fadeOut={0.5}
        followMouse={true}
        mouseInfluence={0.25}
        hoverScale={1.18}
        parallax={0.06}
        clickBurst={true}
        alphaMode="luminance"
      />

      {/* 2. Left-Bottom Metallic Silver-Black Explore More Button */}
      <div className="absolute bottom-8 left-8 z-30 sm:bottom-10 sm:left-10">
        <button
          onClick={onStartLearning}
          type="button"
          className="group relative flex items-center gap-3 px-6 py-3.5 rounded-2xl
                     bg-gradient-to-b from-[#1c1d21] via-[#0f1013] to-[#08090a]
                     border border-neutral-500/70 hover:border-neutral-200
                     text-neutral-200 hover:text-white
                     shadow-[0_8px_30px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.35),inset_0_-1px_1px_rgba(0,0,0,0.7)]
                     hover:shadow-[0_0_35px_rgba(255,255,255,0.25),inset_0_1px_2px_rgba(255,255,255,0.6)]
                     backdrop-blur-xl transition-all duration-300 ease-out hover:scale-105 active:scale-95 cursor-pointer"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <span className="font-semibold text-sm tracking-wide bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-400 bg-clip-text text-transparent group-hover:from-white group-hover:to-neutral-100">
            Explore More
          </span>

          <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-neutral-900/80 border border-neutral-700/80 group-hover:border-neutral-400 group-hover:bg-neutral-800 transition-all duration-300 shadow-inner">
            <svg
              className="w-4 h-4 text-neutral-300 group-hover:text-white transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              style={{ transform: 'rotate(-30deg)' }}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          </div>
        </button>
      </div>

    </div>
  );
};
