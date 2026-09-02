import React from 'react';
import { Layers, Clock, Target, CheckCircle2, Sparkles, ArrowRight, X } from 'lucide-react';
import { LessonPlan } from '../../types';

interface LessonPlanModalProps {
  plan: LessonPlan;
  onConfirmStart: () => void;
  onClose: () => void;
}

export const LessonPlanModal: React.FC<LessonPlanModalProps> = ({
  plan,
  onConfirmStart,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-3xl rounded-2xl border border-indigo-500/30 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-950/90 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Layers className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-400">
                  Curriculum Generated
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                  {plan.level} • {plan.language}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {plan.topic}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Summary */}
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-xs sm:text-sm leading-relaxed">
            {plan.summary}
          </div>

          {/* Objectives & Prerequisites */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Mastery Objectives
              </h3>
              <ul className="space-y-1.5">
                {plan.objectives.map((obj, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Prerequisites & Style
              </h3>
              <div className="text-xs text-slate-300 space-y-1.5">
                <div>
                  <span className="text-slate-500">Style: </span>
                  <span className="font-semibold text-slate-200">{plan.teaching_style}</span>
                </div>
                <div>
                  <span className="text-slate-500">Duration: </span>
                  <span className="font-semibold text-slate-200">{plan.duration_minutes} Minutes</span>
                </div>
                <div>
                  <span className="text-slate-500">Prereqs: </span>
                  <span className="text-slate-300">{plan.prerequisites.join(', ')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progressive Segments */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Progressive Lesson Segments
            </h3>

            <div className="space-y-2.5">
              {plan.lesson_segments.map((seg, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-cyan-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        {seg.concept}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {seg.objective}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                          Strategy: {seg.explanation_strategy}
                        </span>
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">
                          Visual: {seg.visual_type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between text-xs text-slate-400 flex-shrink-0">
                    <span>{seg.estimated_duration_minutes} mins</span>
                    <span className="text-emerald-400 font-semibold text-[11px]">
                      Target: {Math.round(seg.expected_mastery * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Edit Settings
          </button>

          <button
            onClick={onConfirmStart}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <span>Enter AI Classroom</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
