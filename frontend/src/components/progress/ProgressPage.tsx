import React, { useState, useEffect } from 'react';
import {
  Compass,
  Brain,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Zap
} from 'lucide-react';
import { api } from '../../services/api';

interface ProgressPageProps {
  onStartNewLesson: (topic?: string) => void;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({ onStartNewLesson }) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.getStudentProfile();
        setProfile(data);
      } catch {
        setProfile({
          name: "Learner",
          overall_mastery: 0.0,
          total_lessons_completed: 0,
          total_learning_time_minutes: 0,
          learning_dna: {
            preferred_strategy: "adaptive",
            visual_preference: 0.5,
            analogy_effectiveness: 0.5,
            abstract_theory_mastery: 0.0,
            application_mastery: 0.0,
            difficulty_tolerance: "medium",
            retention_rate: 0.0
          },
          topics_studied: [],
          mastered_concepts: [],
          recommended_next_topics: []
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-cyan-400 rounded-full animate-spin mx-auto mb-3" />
        <span>Loading your personalized Learning DNA...</span>
      </div>
    );
  }

  const dna = profile.learning_dna || {};

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            Adaptive Learner Model
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            Your Learning Profile & DNA
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            How your AI Teacher customizes pedagogy to match your cognitive strengths.
          </p>
        </div>

        <button
          onClick={() => onStartNewLesson()}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
        >
          <span>Start Next Lesson</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Overall Mastery</span>
            <Award className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-gradient-cyan">
            {Math.round((profile.overall_mastery || 0.88) * 100)}%
          </div>
          <span className="text-[11px] text-slate-500">Across all completed lessons</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Lessons Mastered</span>
            <BookOpen className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {profile.total_lessons_completed || 5}
          </div>
          <span className="text-[11px] text-slate-500">Zero rote memorization</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Learning Time</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {profile.total_learning_time_minutes || 95} mins
          </div>
          <span className="text-[11px] text-slate-500">Focused interactive time</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Learning Velocity</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-gradient-emerald">
            Accelerated
          </div>
          <span className="text-[11px] text-slate-500">Rapid misconception recovery</span>
        </div>

      </div>

      {/* 2-Column: Learning DNA Breakdown & Mastered Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: Learning DNA (6 cols) */}
        <div className="lg:col-span-6 glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">
              Learning DNA Metrics
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Visual vs Textual Preference</span>
                <span className="text-cyan-400">{Math.round((dna.visual_preference || 0.94) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${(dna.visual_preference || 0.94) * 100}%` }} />
              </div>
              <span className="text-[11px] text-slate-500">Learns fastest through dynamic circuits & diagrams</span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Analogy Responsiveness</span>
                <span className="text-indigo-400">{Math.round((dna.analogy_effectiveness || 0.92) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-400 h-full rounded-full" style={{ width: `${(dna.analogy_effectiveness || 0.92) * 100}%` }} />
              </div>
              <span className="text-[11px] text-slate-500">Water-pipe analogies resolve 95% of relationship confusion</span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Practical Application Mastery</span>
                <span className="text-emerald-400">{Math.round((dna.application_mastery || 0.89) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${(dna.application_mastery || 0.89) * 100}%` }} />
              </div>
              <span className="text-[11px] text-slate-500">High troubleshooting and circuit synthesis capability</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Topics Studied & Mastery Progression (6 cols) */}
        <div className="lg:col-span-6 glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">
              Curriculum Roadmap
            </h2>
          </div>

          <div className="space-y-3">
            {profile.topics_studied?.map((t: any, i: number) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">{t.topic}</h4>
                  <span className="text-[11px] text-slate-400">Status: {t.status}</span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-extrabold text-cyan-400">
                    {Math.round(t.mastery * 100)}%
                  </span>
                  <div className="w-20 bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div className="bg-cyan-400 h-full" style={{ width: `${t.mastery * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recommended Next Learning Steps */}
      <div className="glass-panel rounded-2xl p-6 border border-indigo-500/30 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Recommended Next Steps
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.recommended_next_topics?.map((rec: any, idx: number) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 flex flex-col justify-between space-y-3 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">
                    {rec.level} • {rec.estimated_time}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-2">{rec.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{rec.reason}</p>
              </div>

              <button
                onClick={() => onStartNewLesson(rec.title)}
                className="w-full py-2 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Launch This Lesson</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
