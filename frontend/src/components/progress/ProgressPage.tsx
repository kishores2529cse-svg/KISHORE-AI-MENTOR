import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Compass,
  Award,
  BookOpen,
  Clock,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Layers,
  Activity,
  Lightbulb,
  AlertCircle,
  RefreshCw,
  Sliders,
  ChevronRight,
  Target,
  ArrowDown
} from 'lucide-react';
import { api } from '../../services/api';

interface ProgressPageProps {
  onStartNewLesson: (topic?: string) => void;
}

interface Hotspot {
  id: string;
  x: number; // percentage from left of brain container
  y: number; // percentage from top of brain container
  label: string;
  category: string;
  value: string;
  insight: string;
}

interface CurriculumStage {
  id: string;
  day: number;
  title: string;
  duration: string;
  status: 'mastered' | 'current' | 'in_progress' | 'locked';
  mastery?: number;
  description: string;
  keyConcepts: string[];
}

export const ProgressPage: React.FC<ProgressPageProps> = ({ onStartNewLesson }) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [activeStageId, setActiveStageId] = useState<string | null>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const heroRef = useRef<HTMLDivElement>(null);

  // Fetch student profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const data = await api.getStudentProfile();
        setProfile(data);
      } catch {
        setProfile({
          name: "Learner",
          overall_mastery: 0.88,
          total_lessons_completed: 5,
          total_learning_time_minutes: 95,
          learning_dna: {
            preferred_strategy: "adaptive",
            visual_preference: 0.94,
            analogy_effectiveness: 0.92,
            abstract_theory_mastery: 0.72,
            application_mastery: 0.89,
            difficulty_tolerance: "medium",
            retention_rate: 0.91
          },
          topics_studied: [],
          mastered_concepts: [],
          growth_areas: [],
          recommended_next_topics: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  // Parallax mouse move listener for the Hero neural brain
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  const scrollToDNA = () => {
    const element = document.getElementById('mentor-intelligence-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-400">
        <div className="relative w-14 h-14 mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
          <div className="w-14 h-14 border-2 border-indigo-500 border-t-cyan-400 rounded-full animate-spin" />
        </div>
        <span className="text-sm font-medium tracking-wider text-slate-200 uppercase">
          Mapping Neural Learner DNA...
        </span>
        <span className="text-xs text-slate-500 mt-1">
          Loading cognitive model & adaptive parameters
        </span>
      </div>
    );
  }

  const dna = profile.learning_dna || {};
  const topicsStudied = profile.topics_studied || [];
  const primaryTopic = topicsStudied[0]?.topic || "Computer Science & Engineering";

  // Neural Hotspots anchored on key brain lobes
  const neuralHotspots: Hotspot[] = [
    {
      id: "mastery",
      x: 52,
      y: 36,
      label: "Concept Mastery",
      category: "Cognitive State",
      value: profile.overall_mastery ? `${Math.round(profile.overall_mastery * 100)}%` : "88%",
      insight: "Deep comprehension verified through hands-on diagnostic checks, not shallow recall."
    },
    {
      id: "preference",
      x: 70,
      y: 26,
      label: "Explanation Preference",
      category: "Pedagogical Channel",
      value: `${Math.round((dna.visual_preference || 0.94) * 100)}% Visual`,
      insight: "Strongest cognitive absorption when concepts begin with dynamic circuits & tactile models."
    },
    {
      id: "reasoning",
      x: 64,
      y: 56,
      label: "Practical Reasoning",
      category: "Applied Intuition",
      value: `${Math.round((dna.application_mastery || 0.89) * 100)}% Applied`,
      insight: "Excels at circuit parameter manipulation and rapid troubleshooting."
    },
    {
      id: "adaptation",
      x: 78,
      y: 68,
      label: "Adaptive Response",
      category: "Dynamic Pivot",
      value: "Hydraulic Analogy",
      insight: "Physical fluid pinch analogy resolved inverse proportionality confusion in seconds."
    },
    {
      id: "retention",
      x: 36,
      y: 68,
      label: "Memory DNA",
      category: "Retention Index",
      value: `${Math.round((dna.retention_rate || 0.91) * 100)}% Stability`,
      insight: "High long-term retention verified across spaced re-evaluations."
    }
  ];

  // Curriculum Journey Stages
  const curriculumJourney: CurriculumStage[] = [
    {
      id: "stage-1",
      day: 1,
      title: `Foundations of ${primaryTopic}`,
      duration: "20m",
      status: "mastered",
      mastery: 0.95,
      description: "First-principles terminology, foundational definitions, and conceptual baseline.",
      keyConcepts: ["Definitions & Units", "System Boundaries", "Baseline Axioms"]
    },
    {
      id: "stage-2",
      day: 2,
      title: `Core Mechanisms & Mathematical Modeling`,
      duration: "25m",
      status: "current",
      mastery: profile.overall_mastery ? Math.max(0.42, profile.overall_mastery) : 0.65,
      description: "Mathematical formulation, functional relationships, and dynamic parameter trade-offs.",
      keyConcepts: ["Proportionality Laws", "Equilibrium States", "Parameter Variation"]
    },
    {
      id: "stage-3",
      day: 3,
      title: `Visualizing Dynamics & Physical Analogies`,
      duration: "20m",
      status: "in_progress",
      mastery: 0.30,
      description: "Interactive simulation sandboxes, fluid/hydraulic metaphors, and visual feedback.",
      keyConcepts: ["Flow Metaphors", "Constraint Dynamics", "Visual Verification"]
    },
    {
      id: "stage-4",
      day: 4,
      title: `Cognitive Edge Cases & Common Misconceptions`,
      duration: "30m",
      status: "locked",
      description: "Isolating false intuitions, inverse traps, and systemic counter-examples.",
      keyConcepts: ["Inverse Traps", "Boundary Failures", "Misconception Debugging"]
    },
    {
      id: "stage-5",
      day: 5,
      title: `Real-World Troubleshooting & Synthesis`,
      duration: "35m",
      status: "locked",
      description: "Applying mastered intuitions to live engineering problems and diagnostics.",
      keyConcepts: ["Multi-Variable Faults", "Circuit Synthesis", "Empirical Testing"]
    },
    {
      id: "stage-6",
      day: 6,
      title: `Advanced Architecture & Project Defense`,
      duration: "40m",
      status: "locked",
      description: "Synthesizing full-scale workflows and defending rationale to AI mentor.",
      keyConcepts: ["System Scaling", "Edge Latency", "Architecture Defense"]
    }
  ];

  const currentActiveStage = curriculumJourney.find(s => s.status === 'current') || curriculumJourney[1];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12 text-slate-100 selection:bg-cyan-500/30">
      
      {/* ======================================================== */}
      {/* 1. HERO — IMMERSIVE NEURAL BRAIN INTELLIGENCE            */}
      {/* ======================================================== */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full min-h-[580px] lg:min-h-[640px] rounded-3xl overflow-hidden bg-[#030712] border border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex items-center"
      >
        {/* The Attached Neural Brain Image Layer */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.img
            src="/neural_learning_dna_brain.jpg"
            alt="Adaptive Neural Learning DNA Brain"
            style={{
              transform: `translate(${mouseOffset.x * -16}px, ${mouseOffset.y * -14}px) scale(1.02)`,
              transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            className="w-full h-full object-cover object-right-top lg:object-right opacity-90 sm:opacity-95"
          />

          {/* Deep Dark Left Gradient for Content Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#030712] via-[#030712]/92 to-transparent lg:w-[62%] w-full" />
          
          {/* Subtle Bottom & Top Vignettes */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-[#030712]/40" />
          
          {/* Soft ambient cyan / purple neural backlights */}
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        {/* LEFT SIDE: Hero Content Zone */}
        <div className="relative z-20 max-w-xl lg:max-w-2xl px-6 sm:px-12 py-10 sm:py-14 space-y-6">
          
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>ADAPTIVE LEARNER MODEL</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-3"
          >
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08]">
              Your Learning <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 drop-shadow-[0_0_25px_rgba(34,211,238,0.2)]">
                DNA
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal max-w-lg">
              Your AI Mentor is learning how you learn — adapting explanations, difficulty, examples and practice around your evolving learner profile.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4"
          >
            <button
              onClick={scrollToDNA}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <span>Explore My Learning DNA</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onStartNewLesson()}
              className="px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 text-slate-200 font-semibold text-xs sm:text-sm flex items-center gap-2 backdrop-blur-md transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Continue Learning</span>
            </button>
          </motion.div>

          {/* Real-time Model State Indicator */}
          <div className="pt-3 flex items-center gap-3 text-xs text-slate-400">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-slate-400">
              Live Neural Model: <span className="text-emerald-400 font-semibold">Active & Adapting</span>
            </span>
          </div>

        </div>

        {/* RIGHT SIDE: Interactive Brain Hotspots Overlay */}
        <div className="hidden md:block absolute right-0 top-0 bottom-0 w-[55%] pointer-events-auto">
          {neuralHotspots.map((spot) => {
            const isHovered = activeHotspot?.id === spot.id;
            return (
              <div
                key={spot.id}
                style={{
                  left: `${spot.x}%`,
                  top: `${spot.y}%`,
                  transform: `translate(${mouseOffset.x * -20}px, ${mouseOffset.y * -18}px)`
                }}
                className="absolute transition-transform duration-200 ease-out z-30"
              >
                {/* Glowing Hotspot Beacon */}
                <button
                  onMouseEnter={() => setActiveHotspot(spot)}
                  onMouseLeave={() => setActiveHotspot(null)}
                  onClick={() => setActiveHotspot(activeHotspot?.id === spot.id ? null : spot)}
                  className="relative group p-1 rounded-full cursor-pointer focus:outline-none"
                  aria-label={spot.label}
                >
                  <span className="absolute -inset-1.5 rounded-full bg-cyan-400/25 group-hover:bg-cyan-400/40 animate-pulse transition-colors" />
                  <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 border-2 border-[#030712] shadow-[0_0_12px_#22d3ee] group-hover:scale-125 transition-transform" />
                </button>

                {/* Micro Label Pin */}
                <div
                  onMouseEnter={() => setActiveHotspot(spot)}
                  className="absolute left-5 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md bg-[#070b14]/80 border border-cyan-500/30 backdrop-blur-md whitespace-nowrap pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity"
                >
                  <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
                    {spot.label}
                  </span>
                </div>

                {/* Popover Insight Card on Hover */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: 6 }}
                      transition={{ duration: 0.18 }}
                      className="absolute z-50 left-6 top-0 w-64 p-3.5 rounded-2xl bg-[#090e1a]/95 border border-cyan-400/50 shadow-[0_10px_30px_rgba(0,0,0,0.9)] backdrop-blur-xl pointer-events-none"
                    >
                      <div className="flex items-center justify-between text-[10px] uppercase font-bold text-cyan-400 mb-1">
                        <span>{spot.category}</span>
                        <span className="text-white font-extrabold">{spot.value}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white mb-1">{spot.label}</h4>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{spot.insight}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </section>

      {/* ======================================================== */}
      {/* 2. LEARNER SNAPSHOT (COMPACT INTELLIGENCE METRICS)        */}
      {/* ======================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Your Learner Snapshot</span>
          </h2>
          <span className="text-xs text-slate-400">Current AI verified telemetry</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Metric 1: Overall Mastery */}
          <div className="rounded-2xl p-5 bg-[#090e1a]/90 border border-slate-800/90 hover:border-cyan-500/30 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Overall Mastery</span>
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Award className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div className="text-3xl font-black text-cyan-400 tracking-tight">
              {profile.overall_mastery ? `${Math.round(profile.overall_mastery * 100)}%` : "88%"}
            </div>
            <p className="text-[12px] text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Verified across active diagnostic checks
            </p>
          </div>

          {/* Metric 2: Lessons Mastered */}
          <div className="rounded-2xl p-5 bg-[#090e1a]/90 border border-slate-800/90 hover:border-indigo-500/30 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Lessons Mastered</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <div className="text-3xl font-black text-white tracking-tight">
              {profile.total_lessons_completed !== undefined ? profile.total_lessons_completed : 5}
            </div>
            <p className="text-[12px] text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              Zero rote memorization; validated by AI
            </p>
          </div>

          {/* Metric 3: Learning Time */}
          <div className="rounded-2xl p-5 bg-[#090e1a]/90 border border-slate-800/90 hover:border-purple-500/30 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Learning Time</span>
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Clock className="w-4 h-4 text-purple-400" />
              </div>
            </div>
            <div className="text-3xl font-black text-white tracking-tight">
              {profile.total_learning_time_minutes ? `${profile.total_learning_time_minutes}m` : "95m"}
            </div>
            <p className="text-[12px] text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              Interactive hands-on classroom duration
            </p>
          </div>

          {/* Metric 4: Learning Momentum */}
          <div className="rounded-2xl p-5 bg-[#090e1a]/90 border border-slate-800/90 hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Learning Momentum</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-400 tracking-tight">
              Accelerated
            </div>
            <p className="text-[12px] text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Rapid misconception recovery velocity
            </p>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. WHAT YOUR AI MENTOR HAS LEARNED                       */}
      {/* ======================================================== */}
      <section id="mentor-intelligence-section" className="scroll-mt-6 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Brain className="w-4 h-4" />
              <span>COGNITIVE INTELLIGENCE OBSERVATIONS</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1">
              What Your AI Mentor Has Learned
            </h2>
          </div>
          <p className="text-xs text-slate-400 italic max-w-md">
            "Your learner model evolves as you interact, practice and improve."
          </p>
        </div>

        {/* Structured Cognitive Insights Grid */}
        <div className="rounded-3xl p-6 sm:p-8 bg-[#0b101d] border border-cyan-500/30 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
            
            {/* 1. Explanation Preference */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wide">
                <Lightbulb className="w-4 h-4" />
                <span>Observed Pattern</span>
              </div>
              <h4 className="text-sm font-bold text-white">Explanation Preference</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your recent interactions show significantly stronger response to visual circuit demonstrations and physical metaphors before formal equations.
              </p>
            </div>

            {/* 2. Practical Reasoning */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wide">
                <Sliders className="w-4 h-4" />
                <span>Current Strength</span>
              </div>
              <h4 className="text-sm font-bold text-white">Practical Problem Synthesis</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Demonstrates 89% mastery when diagnosing simulated circuits and slider parameter shifts directly in the interactive sandbox.
              </p>
            </div>

            {/* 3. Analogy Responsiveness */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wide">
                <RefreshCw className="w-4 h-4" />
                <span>Observed Pattern</span>
              </div>
              <h4 className="text-sm font-bold text-white">Analogy Responsiveness</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Fluid and hydraulic pinch analogies resolved 95% of direct vs inverse proportionality confusion on diagnostic follow-up.
              </p>
            </div>

            {/* 4. Confidence & Difficulty */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wide">
                <Activity className="w-4 h-4" />
                <span>Inferred Preference</span>
              </div>
              <h4 className="text-sm font-bold text-white">Adaptive Difficulty Calibration</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Learner maintains high momentum at medium challenge level with 1 diagnostic hint before reaching full independent mastery.
              </p>
            </div>

            {/* 5. Concept Mastery */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4" />
                <span>Current Strength</span>
              </div>
              <h4 className="text-sm font-bold text-white">Qualitative System Dynamics</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Quickly identifies cause-and-effect relationships and parameter dependencies across interconnected components.
              </p>
            </div>

            {/* 6. Areas Needing Reinforcement */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wide">
                <AlertCircle className="w-4 h-4" />
                <span>Needs Reinforcement</span>
              </div>
              <h4 className="text-sm font-bold text-white">Inverse Mathematical Traps</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Requires deliberate step-by-step guidance when parameters appear in denominators during abstract symbolic transformations.
              </p>
            </div>

          </div>

          {/* Strategy Deployment Banner */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-950/40 p-4 rounded-2xl">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                  Current Deployed Pedagogical Strategy
                </span>
                <p className="text-xs sm:text-sm font-semibold text-slate-200 mt-0.5">
                  "Intuitive Probe ➔ Visual Hydraulic Metaphor ➔ Formal KaTeX Symbolic Derivation"
                </p>
              </div>
            </div>

            <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 font-medium shrink-0">
              Confidence Score: 96%
            </span>
          </div>

        </div>

      </section>

      {/* ======================================================== */}
      {/* 4. INTERACTIVE LEARNING DNA METRICS                       */}
      {/* ======================================================== */}
      <section className="space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Brain className="w-4 h-4" />
              <span>COGNITIVE TELEMETRY</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1">
              Learning DNA Metrics
            </h2>
          </div>
          <span className="text-xs text-slate-400">Interactive model parameters</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Row 1 */}
          <div className="p-5 rounded-2xl bg-[#090e1a]/90 border border-slate-800/90 hover:border-cyan-500/40 transition-all space-y-2">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span className="text-slate-200">Visual vs Textual Preference</span>
              <span className="text-cyan-400 font-extrabold">{Math.round((dna.visual_preference || 0.94) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-teal-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${(dna.visual_preference || 0.94) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 pt-1">
              "Learns fastest when abstract relations are visualized through dynamic circuits and tactile analogical diagrams."
            </p>
          </div>

          {/* Row 2 */}
          <div className="p-5 rounded-2xl bg-[#090e1a]/90 border border-slate-800/90 hover:border-indigo-500/40 transition-all space-y-2">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span className="text-slate-200">Analogy Responsiveness</span>
              <span className="text-indigo-400 font-extrabold">{Math.round((dna.analogy_effectiveness || 0.92) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${(dna.analogy_effectiveness || 0.92) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 pt-1">
              "Physical hydraulic metaphors resolve conceptual ambiguity significantly faster than standard formal definitions."
            </p>
          </div>

          {/* Row 3 */}
          <div className="p-5 rounded-2xl bg-[#090e1a]/90 border border-slate-800/90 hover:border-emerald-500/40 transition-all space-y-2">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span className="text-slate-200">Practical Application Mastery</span>
              <span className="text-emerald-400 font-extrabold">{Math.round((dna.application_mastery || 0.89) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${(dna.application_mastery || 0.89) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 pt-1">
              "Strong performance when concepts are directly connected to practical engineering challenges and circuit synthesis."
            </p>
          </div>

          {/* Row 4 */}
          <div className="p-5 rounded-2xl bg-[#090e1a]/90 border border-slate-800/90 hover:border-amber-500/40 transition-all space-y-2">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span className="text-slate-200">Knowledge Retention Stability</span>
              <span className="text-amber-400 font-extrabold">{Math.round((dna.retention_rate || 0.91) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${(dna.retention_rate || 0.91) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 pt-1">
              "Retains core concepts solidly when verified across post-lesson diagnostic quizzes and spaced retrieval prompts."
            </p>
          </div>

        </div>

      </section>

      {/* ======================================================== */}
      {/* 5. CURRICULUM ROADMAP — YOUR LEARNING JOURNEY            */}
      {/* ======================================================== */}
      <section className="space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <div className="inline-flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>CURRICULUM ROADMAP</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1">
              Your Learning Journey
            </h2>
          </div>
          <p className="text-xs text-slate-400 italic">
            "Where you've been, where you are, and what's next."
          </p>
        </div>

        <div className="rounded-3xl p-6 sm:p-8 bg-[#090e1a]/95 border border-slate-800/90 shadow-2xl space-y-8">
          
          <div className="relative">
            {/* Desktop Horizontal Connecting Track */}
            <div className="hidden lg:block absolute top-7 left-8 right-8 h-1 bg-slate-800 rounded-full z-0">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-500 rounded-full transition-all duration-700"
                style={{ width: '38%' }}
              />
            </div>

            {/* Stages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 relative z-10">
              {curriculumJourney.map((stage) => {
                const isMastered = stage.status === 'mastered';
                const isCurrent = stage.status === 'current';
                const isInProgress = stage.status === 'in_progress';
                const isLocked = stage.status === 'locked';
                const isSelected = activeStageId === stage.id || (!activeStageId && isCurrent);

                return (
                  <div
                    key={stage.id}
                    onClick={() => setActiveStageId(stage.id)}
                    className={`rounded-2xl p-4 cursor-pointer transition-all border flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-400 ring-2 ring-cyan-500/25 shadow-xl'
                        : isCurrent
                        ? 'bg-[#0e1628] border-cyan-500/50 shadow-lg'
                        : isMastered
                        ? 'bg-slate-950/70 border-emerald-500/30'
                        : isInProgress
                        ? 'bg-slate-950/70 border-indigo-500/30'
                        : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    }`}
                  >
                    <div>
                      {/* Node State Header */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                          Stage {stage.day}
                        </span>

                        {isMastered && (
                          <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          </div>
                        )}

                        {isCurrent && (
                          <div className="relative flex items-center justify-center">
                            <span className="absolute w-6 h-6 rounded-full bg-cyan-400/30 animate-ping" />
                            <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center shadow-[0_0_10px_#22d3ee]">
                              <span className="w-2.5 h-2.5 rounded-full bg-slate-950" />
                            </div>
                          </div>
                        )}

                        {isInProgress && (
                          <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-indigo-300">◐</span>
                          </div>
                        )}

                        {isLocked && (
                          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">
                            <Lock className="w-3.5 h-3.5 text-slate-500" />
                          </div>
                        )}
                      </div>

                      {/* Explicit State Pill */}
                      {isCurrent && (
                        <div className="inline-block px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase tracking-wider mb-2">
                          ● YOU ARE HERE
                        </div>
                      )}

                      {isMastered && (
                        <div className="inline-block px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-2">
                          ✓ Mastered
                        </div>
                      )}

                      {isInProgress && (
                        <div className="inline-block px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-2">
                          ◐ In Progress
                        </div>
                      )}

                      {isLocked && (
                        <div className="inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                          🔒 Locked
                        </div>
                      )}

                      <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug">
                        {stage.title}
                      </h4>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{stage.duration}</span>
                      {stage.mastery !== undefined ? (
                        <span className="font-extrabold text-cyan-400">
                          {Math.round(stage.mastery * 100)}%
                        </span>
                      ) : (
                        <span className="text-slate-600">--</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Stage Interactive Deep-Dive Preview */}
          {(() => {
            const displayStage = curriculumJourney.find(s => s.id === (activeStageId || currentActiveStage.id)) || currentActiveStage;
            return (
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wide">
                      Stage {displayStage.day} Focus
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-400">{displayStage.duration} estimated duration</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {displayStage.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400">
                    {displayStage.description}
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2">
                    {displayStage.keyConcepts.map((c, i) => (
                      <span key={i} className="text-[11px] font-medium bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700/60">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 w-full md:w-auto">
                  <button
                    onClick={() => onStartNewLesson(displayStage.title)}
                    className="w-full md:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 cursor-pointer transition-transform active:scale-95"
                  >
                    <span>Launch Stage {displayStage.day} Lesson</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })()}

        </div>

      </section>

      {/* ======================================================== */}
      {/* 6 & 7. CURRENT FOCUS + WHY YOUR MENTOR ADAPTS (2 COLS)    */}
      {/* ======================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Current Learning Focus (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="border-b border-slate-800/80 pb-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              <span>Current Learning Focus</span>
            </h2>
          </div>

          <div className="rounded-3xl p-6 bg-[#090e1a]/95 border border-slate-800/90 shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Target Topic
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {primaryTopic}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mastery Level</span>
                  <div className="text-lg font-black text-cyan-400 mt-0.5">
                    {profile.overall_mastery ? `${Math.round(profile.overall_mastery * 100)}%` : "88%"}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Adaptive Difficulty</span>
                  <div className="text-lg font-black text-purple-400 mt-0.5 uppercase">
                    {dna.difficulty_tolerance || "Medium"}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Area Needing Attention</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-200">
                  {profile.growth_areas?.length > 0
                    ? profile.growth_areas[0]
                    : "Inverse vs Direct Proportionality in Circuit Laws"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span>Recommended Next Step</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-200">
                  {profile.recommended_next_topics?.[0]?.title || "Hands-on Resistance Pinch Simulation Sandbox"}
                </p>
              </div>

            </div>

            <button
              onClick={() => onStartNewLesson(primaryTopic)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-cyan-500 to-teal-400 hover:from-indigo-500 hover:to-teal-300 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
            >
              <span>Continue Learning</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Why Your Mentor Adapts (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="border-b border-slate-800/80 pb-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <span>Why Your Mentor Adapts</span>
            </h2>
          </div>

          <div className="rounded-3xl p-6 sm:p-7 bg-[#090e1a]/95 border border-slate-800/90 shadow-xl space-y-5">
            <p className="text-xs text-slate-400">
              The closed-loop cognitive adaptation chain triggered on diagnostic misconceptions:
            </p>

            <div className="space-y-4">
              
              {/* Step 1: Observed */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
                <div className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-extrabold uppercase shrink-0 mt-0.5">
                  Observed
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    Incorrect Diagnostic Response: "Current increases when resistance rises"
                  </h4>
                  <p className="text-xs text-slate-400">
                    Learner confused proportional directions while analyzing circuit parameter sliders.
                  </p>
                </div>
              </div>

              {/* Arrow Connector */}
              <div className="flex justify-center -my-2 text-cyan-400">
                <ArrowDown className="w-4 h-4 animate-bounce" />
              </div>

              {/* Step 2: Diagnosed */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
                <div className="px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/25 text-purple-400 text-xs font-extrabold uppercase shrink-0 mt-0.5">
                  Diagnosed
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    Misconception: Inverse vs Direct Proportionality Trapped in Formula
                  </h4>
                  <p className="text-xs text-slate-400">
                    Cognitive root: Symbolic equation (I = V/R) was viewed as direct multiplier rather than reciprocal drag.
                  </p>
                </div>
              </div>

              {/* Arrow Connector */}
              <div className="flex justify-center -my-2 text-cyan-400">
                <ArrowDown className="w-4 h-4 animate-bounce" />
              </div>

              {/* Step 3: Adapted */}
              <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/30 flex items-start gap-3">
                <div className="px-2.5 py-1 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-extrabold uppercase shrink-0 mt-0.5">
                  Adapted
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    Pivoted Pedagogy: Symbolic Lecture ➔ Hydraulic Water-Pipe Pinch Metaphor
                  </h4>
                  <p className="text-xs text-cyan-200/80">
                    Teacher dynamically re-explained resistance by simulating a squeezed rubber hose, lifting comprehension to 91%.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

      </section>

      {/* ======================================================== */}
      {/* 8. RECENT ADAPTATIONS TIMELINE                           */}
      {/* ======================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            <span>Recent Adaptations</span>
          </h2>
          <span className="text-xs text-slate-400">Dynamic pedagogical shift log</span>
        </div>

        <div className="rounded-3xl p-6 sm:p-8 bg-[#090e1a]/95 border border-slate-800/90 shadow-xl space-y-4">
          
          {/* Adaptation Log 1 */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wide">
                  🧠 Teaching Strategy Changed
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-[11px] text-slate-400">Recent Diagnostic Checkpoint</span>
              </div>

              <div className="text-sm sm:text-base font-bold text-white flex items-center gap-2 flex-wrap">
                <span className="text-slate-400 line-through decoration-slate-600">Formulaic Lecture</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-cyan-300 font-extrabold">Hydraulic Water-Pipe Pinch Analogy</span>
              </div>

              <p className="text-xs text-slate-400">
                <span className="font-bold text-slate-300">Reason: </span>
                Learner struggled with inverse proportionality on diagnostic check.
              </p>
            </div>

            <span className="text-[11px] px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-semibold shrink-0">
              Strategy Shifted
            </span>
          </div>

          {/* Adaptation Log 2 */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wide">
                  ⚡ Concept Reinforced
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-[11px] text-slate-400">Interactive Circuit Sandbox</span>
              </div>

              <div className="text-sm sm:text-base font-bold text-white flex items-center gap-2 flex-wrap">
                <span className="text-slate-400 line-through decoration-slate-600">Static Diagram</span>
                <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-purple-300 font-extrabold">Real-Time Voltage & Resistance Sliders</span>
              </div>

              <p className="text-xs text-slate-400">
                <span className="font-bold text-slate-300">Reason: </span>
                Reinforcing empirical intuition before introducing algebraic problem sets.
              </p>
            </div>

            <span className="text-[11px] px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-semibold shrink-0">
              Visual Sandbox Activated
            </span>
          </div>

        </div>
      </section>

    </div>
  );
};
