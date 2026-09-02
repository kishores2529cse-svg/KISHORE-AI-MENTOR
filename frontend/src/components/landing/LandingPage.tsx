import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Upload,
  Brain,
  Layers,
  HelpCircle,
  AlertTriangle,
  RefreshCw,
  Award,
  Globe,
  Compass,
  Zap,
  CheckCircle2,
  FileText,
  Video
} from 'lucide-react';

interface LandingPageProps {
  onStartLearning: () => void;
  onUploadMaterial: () => void;
  onLaunchDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartLearning,
  onUploadMaterial,
  onLaunchDemo,
}) => {
  const steps = [
    { label: 'Understand', icon: Brain, desc: 'Assess learner level & cognitive goals' },
    { label: 'Plan', icon: Layers, desc: 'Generate multi-segment curriculum' },
    { label: 'Explain', icon: Sparkles, desc: 'Teach via spoken pedagogy & intuition' },
    { label: 'Question', icon: HelpCircle, desc: 'Continuous diagnostic verification' },
    { label: 'Detect Misconception', icon: AlertTriangle, desc: 'Pinpoint flawed mental models' },
    { label: 'Adapt & Re-teach', icon: RefreshCw, desc: 'Shift to physical analogies & visuals' },
    { label: 'Mastery & Report', icon: Award, desc: 'Deep comprehension verified' }
  ];

  return (
    <div className="min-h-screen pb-20">
      
      {/* Hero Section */}
      <section className="relative pt-10 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          KISHORE AI Mentor • Dedicated 1-on-1 AI Video Teacher
        </div>

        {/* Mentor Avatar Hero Badge */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl p-1 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-violet-500 shadow-2xl shadow-indigo-500/30 hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-[22px] overflow-hidden bg-slate-950">
              <img src="/mentor_avatar.jpg" alt="KISHORE AI Mentor" className="w-full h-full object-cover object-top" />
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-2 text-xs font-bold text-slate-300">
            <span>KISHORE AI Mentor</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-400 font-semibold">Online & Ready to Elucidate</span>
          </div>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
          Understand. <br />
          <span className="text-gradient-cyan">Don't Just Memorize.</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          "It doesn't just answer. It understands how you learn."
        </p>

        <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
          Upload any document like NotebookLM or enter any topic. Kishore S will appear in a live 1-on-1 video call, speaking humanly, elucidating concepts intuitively, checking your understanding, and adapting to you in real-time.
        </p>

        {/* Hero CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onStartLearning}
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm sm:text-base shadow-xl shadow-indigo-500/25 hover:scale-105 active:scale-95 transition-all"
          >
            <Video className="w-4 h-4" />
            <span>Explore AI Mentor Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onUploadMaterial}
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl glass-panel hover:bg-slate-800/80 border border-slate-700/80 text-slate-200 font-semibold text-sm sm:text-base hover:scale-105 active:scale-95 transition-all"
          >
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Upload Study Material</span>
          </button>

          <button
            onClick={onLaunchDemo}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 font-semibold text-sm sm:text-base hover:scale-105 active:scale-95 transition-all shadow-md shadow-amber-500/10"
          >
            <Zap className="w-4 h-4 text-amber-400 fill-current" />
            <span>⚡ 1-Click Video Demo</span>
          </button>
        </div>
      </section>

      {/* Teaching Loop Workflow Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8">
        <div className="glass-panel rounded-2xl p-6 sm:p-10 border border-slate-800 relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase">
              Adaptive Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              The Adaptive Pedagogical Loop
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Every interaction is driven by continuous cognitive evaluation and real-time human mentorship.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 relative z-10">
            {steps.map((s, idx) => (
              <div
                key={idx}
                className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col items-center text-center glass-card-hover group"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
                  <s.icon className="w-5 h-5 text-indigo-400 group-hover:text-cyan-300" />
                </div>
                <div className="text-xs font-bold text-white mb-1">{s.label}</div>
                <div className="text-[11px] text-slate-400 leading-tight">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
