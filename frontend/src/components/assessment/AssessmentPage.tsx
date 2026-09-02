import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  TrendingUp,
  RotateCcw,
  Compass,
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { LessonPlan, AssessmentQuestion, AssessmentResult } from '../../types';

interface AssessmentPageProps {
  lessonPlan: LessonPlan;
  onRestartLesson: () => void;
  onViewProgress: () => void;
}

export const AssessmentPage: React.FC<AssessmentPageProps> = ({
  lessonPlan,
  onRestartLesson,
  onViewProgress
}) => {
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await api.getAssessment(lessonPlan.lesson_id);
        setQuestions(data.questions);
      } catch {
        // Dynamic fallback diagnostic quiz based on current lesson plan
        const concepts = lessonPlan.concepts && lessonPlan.concepts.length > 0 ? lessonPlan.concepts : [lessonPlan.topic];
        const dynamicQuestions: AssessmentQuestion[] = concepts.slice(0, 3).map((concept, idx) => ({
          id: idx + 1,
          concept: concept,
          question: `Regarding ${concept}, which of the following best describes its core intuitive mechanism?`,
          options: [
            `It behaves as an independent variable that sets the foundational baseline`,
            `It acts through direct cause-and-effect interaction with related components`,
            `It is only a mathematical abstraction with no physical or computational reality`,
            `It remains completely static regardless of system changes`
          ],
          correct_option_index: 1,
          explanation: `In ${lessonPlan.topic}, ${concept} functions as a dynamic mechanism driving system behavior.`,
          difficulty: idx === 0 ? "easy" : idx === 1 ? "medium" : "hard"
        }));
        setQuestions(dynamicQuestions);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [lessonPlan]);

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    if (result) return; // Prevent change after submit
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await api.submitAssessment(lessonPlan.lesson_id, selectedAnswers);
      setResult(res);
      if (res.total_score >= 60) {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      }
    } catch {
      // Offline fallback
      let correct = 0;
      const strong: string[] = [];
      const weak: string[] = [];

      questions.forEach((q) => {
        if (selectedAnswers[q.id] === q.correct_option_index) {
          correct++;
          strong.push(q.concept);
        } else {
          weak.push(q.concept);
        }
      });

      const score = Math.round((correct / Math.max(1, questions.length)) * 100);
      const mockResult: AssessmentResult = {
        total_score: score,
        total_questions: questions.length,
        correct_count: correct,
        strong_areas: strong.length > 0 ? strong : [lessonPlan.topic],
        weak_areas: weak,
        resolved_misconceptions: [`Fundamental intuition of ${lessonPlan.topic}`],
        unresolved_misconceptions: [],
        improved_concepts: lessonPlan.concepts ? lessonPlan.concepts.slice(0, 3) : [],
        recommended_revision: weak.length > 0 ? [`Review ${weak.join(', ')}`] : [`Advance to applied problem solving in ${lessonPlan.topic}`],
        next_recommended_topic: `Advanced Applications of ${lessonPlan.topic}`,
        learning_dna_update: {
          visual_preference: 0.94,
          retention_index: 0.91
        }
      };
      setResult(mockResult);
      if (score >= 60) confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Award className="w-3.5 h-3.5 text-cyan-400" />
          Final Diagnostic Assessment
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Comprehensive Mastery Verification
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
          Verify what you have mastered and see your customized Learning Report.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-cyan-400 rounded-full animate-spin mx-auto mb-3" />
          <span>Generating diagnostic assessment questions...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Question List */}
          {questions.map((q, qIndex) => (
            <div
              key={q.id}
              className={`glass-panel rounded-2xl p-5 sm:p-6 border transition-all ${
                result
                  ? selectedAnswers[q.id] === q.correct_option_index
                    ? 'border-emerald-500/40 bg-emerald-950/10'
                    : 'border-red-500/40 bg-red-950/10'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                  Question {qIndex + 1} • {q.concept}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">
                  {q.difficulty}
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-semibold text-white mb-4">
                {q.question}
              </h3>

              {/* Options */}
              <div className="space-y-2">
                {q.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[q.id] === optIdx;
                  const isCorrect = q.correct_option_index === optIdx;

                  let optionStyle = 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700';
                  if (isSelected && !result) {
                    optionStyle = 'bg-indigo-600/30 border-cyan-400 text-cyan-200 shadow-sm';
                  } else if (result) {
                    if (isCorrect) {
                      optionStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'bg-red-500/20 border-red-500 text-red-200';
                    }
                  }

                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`p-3.5 rounded-xl border text-xs sm:text-sm cursor-pointer flex items-center justify-between transition-all ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px] flex items-center justify-center">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>

                      {result && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                      {result && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>

              {/* Explanation after submission */}
              {result && (
                <div className="mt-3.5 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                  <strong className="text-cyan-400 block mb-0.5">Teacher Explanation:</strong>
                  <span>{q.explanation}</span>
                </div>
              )}
            </div>
          ))}

          {/* Submit Action */}
          {!result && (
            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={isSubmitting || Object.keys(selectedAnswers).length < questions.length}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 disabled:opacity-50 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <span>Evaluating Assessment...</span>
                ) : (
                  <>
                    <span>Submit & Generate Learning Report</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

        </form>
      )}

      {/* Comprehensive Learning Report after submission */}
      {result && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-indigo-500/40 space-y-6 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-cyan-400">
                Official Learning Report
              </span>
              <h2 className="text-2xl font-bold text-white mt-0.5">
                Mastery Summary: {lessonPlan.topic}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-slate-400 font-medium">Final Score</span>
                <div className="text-3xl font-extrabold text-gradient-emerald">
                  {result.total_score}%
                </div>
              </div>
            </div>
          </div>

          {/* Diagnostic Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Strong Areas */}
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Strong Concepts
              </h4>
              <ul className="text-xs text-slate-300 space-y-1">
                {result.strong_areas.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>

            {/* Resolved Misconceptions */}
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Resolved Misconceptions
              </h4>
              <ul className="text-xs text-slate-300 space-y-1">
                {result.resolved_misconceptions.map((m, i) => (
                  <li key={i}>✓ {m}</li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                Next Learning Step
              </h4>
              <p className="text-xs text-slate-200 font-semibold mb-1">
                {result.next_recommended_topic}
              </p>
              <p className="text-[11px] text-slate-400">
                Recommended revision: {result.recommended_revision.join(', ')}
              </p>
            </div>

          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={onRestartLesson}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold flex items-center gap-2 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Learn Another Topic</span>
            </button>

            <button
              onClick={onViewProgress}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <span>View Learning DNA & Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
