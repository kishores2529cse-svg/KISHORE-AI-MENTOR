import React, { useState } from 'react';
import {
  BookOpen,
  Upload,
  Clock,
  Globe,
  GraduationCap,
  Sparkles,
  Layers,
  FileCheck,
  Zap,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { LessonPlan, UploadResponse } from '../../types';

interface SetupPageProps {
  onLessonCreated: (plan: LessonPlan) => void;
  onCancel: () => void;
}

export const SetupPage: React.FC<SetupPageProps> = ({ onLessonCreated, onCancel }) => {
  const [mode, setMode] = useState<'topic' | 'document'>('topic');
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState('Beginner');
  const [language, setLanguage] = useState('English');
  const [duration, setDuration] = useState(20);
  const [teachingStyle, setTeachingStyle] = useState('Visual');
  const [learningObjective, setLearningObjective] = useState('Understand concept');
  const [depth, setDepth] = useState('Standard');

  // File upload state
  const [uploadedDoc, setUploadedDoc] = useState<UploadResponse | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const res = await api.uploadMaterial(file);
      setUploadedDoc(res);
      if (res.topics_found && res.topics_found.length > 0) {
        setTopic(res.topics_found[0]);
      }
    } catch (err: any) {
      setError('File upload failed. Ensure the backend server is running.');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const targetTopic = topic.trim() || uploadedDoc?.filename || "Educational Mastery";

    try {
      const plan = await api.createLesson({
        topic: targetTopic,
        document_id: uploadedDoc?.document_id,
        level,
        language,
        duration_minutes: duration,
        teaching_style: teachingStyle,
        learning_objective: learningObjective,
        desired_depth: depth
      });
      onLessonCreated(plan);
    } catch (err: any) {
      // Fallback local plan if offline
      const fallbackPlan: LessonPlan = {
        lesson_id: `lsn_${Date.now().toString(36)}`,
        topic: targetTopic,
        level,
        language,
        duration_minutes: duration,
        teaching_style: teachingStyle,
        learning_objective: learningObjective,
        objectives: [
          `Master fundamental intuition of ${targetTopic}`,
          "Understand core cause-and-effect mechanisms step-by-step",
          "Apply knowledge to practical real-world scenarios"
        ],
        prerequisites: ["Curiosity & Basic Foundations"],
        concepts: [
          `Foundations of ${targetTopic}`,
          `Core Mechanisms & Logic of ${targetTopic}`,
          `Practical Application & Problem Solving in ${targetTopic}`
        ],
        lesson_segments: [
          {
            concept: `Foundations of ${targetTopic}`,
            objective: `Understand fundamental definitions and purpose of ${targetTopic}`,
            estimated_duration_minutes: 5,
            explanation_strategy: "First Principles",
            example: "Everyday concrete scenario",
            visual_type: "diagram",
            question_type: "conceptual",
            expected_mastery: 0.85,
            difficulty: "easy"
          },
          {
            concept: `Core Mechanisms & Logic of ${targetTopic}`,
            objective: `Analyze how variables and components interact in ${targetTopic}`,
            estimated_duration_minutes: 5,
            explanation_strategy: "Cause & Effect Model",
            example: "Parameter variation",
            visual_type: "flowchart",
            question_type: "conceptual",
            expected_mastery: 0.85,
            difficulty: "medium"
          },
          {
            concept: `Practical Application & Problem Solving in ${targetTopic}`,
            objective: `Apply intuition to real-world problem scenarios`,
            estimated_duration_minutes: 5,
            explanation_strategy: "Scenario Simulation",
            example: "Industry best practices",
            visual_type: "diagram",
            question_type: "application",
            expected_mastery: 0.90,
            difficulty: "hard"
          }
        ],
        visual_strategy: { primary: "concept_map" },
        summary: `Personalized ${duration}-minute interactive mastery journey for ${targetTopic}.`
      };
      onLessonCreated(fallbackPlan);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Adaptive Pedagogical Setup
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Configure Your Learning Session
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
          Tell your AI Teacher what you want to master and how you learn best.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleCreateLesson} className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        
        {/* Source Toggle: Direct Topic vs Upload Material */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
            What do you want to learn?
          </label>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              type="button"
              onClick={() => setMode('topic')}
              className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 font-semibold text-xs sm:text-sm transition-all ${
                mode === 'topic'
                  ? 'bg-indigo-600/20 border-indigo-500 text-cyan-300 shadow-md shadow-indigo-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Enter a Topic</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('document')}
              className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 font-semibold text-xs sm:text-sm transition-all ${
                mode === 'document'
                  ? 'bg-indigo-600/20 border-indigo-500 text-cyan-300 shadow-md shadow-indigo-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Document (RAG)</span>
            </button>
          </div>

          {mode === 'topic' ? (
            <div>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Computer Networks TCP, Database Normalization, Calculus Derivatives, Python OOP"
                className="w-full px-4 py-3.5 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-500 text-sm font-medium outline-none transition-all"
                required
              />
              <div className="flex flex-wrap gap-2 mt-2.5">
                <span className="text-[11px] text-slate-400">Try popular topics:</span>
                {[
                  "Computer Networks & TCP Protocols",
                  "Database Normalization (1NF to 3NF)",
                  "Calculus Limits & Derivatives",
                  "Python Async & Event Loop"
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTopic(s)}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors bg-slate-900/40">
              <input
                type="file"
                id="docUpload"
                onChange={handleFileUpload}
                accept=".pdf,.docx,.doc,.pptx,.ppt,.txt"
                className="hidden"
              />
              <label htmlFor="docUpload" className="cursor-pointer flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6 text-indigo-400" />
                </div>
                <span className="text-sm font-semibold text-slate-200">
                  {uploading ? 'Processing & Indexing RAG Chunks...' : 'Click to upload or drag & drop'}
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  Supports PDF, DOCX, PPTX, TXT (Auto-chunked & Grounded)
                </span>
              </label>

              {uploadedDoc && (
                <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold">{uploadedDoc.filename}</span>
                    <span className="text-emerald-400/80">({uploadedDoc.chunk_count} chunks indexed)</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold bg-emerald-500/20 px-2 py-0.5 rounded">
                    RAG Ready
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Form Grid Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
          
          {/* Learner Level */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              Learner Level
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium outline-none focus:border-cyan-400"
            >
              <option value="Beginner">Beginner (Intuition & Analogies)</option>
              <option value="Intermediate">Intermediate (Formulas & Edge Cases)</option>
              <option value="Advanced">Advanced (Rigorous Proofs & Projects)</option>
            </select>
          </div>

          {/* Preferred Language */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              Preferred Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium outline-none focus:border-cyan-400"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi (हिंदी)</option>
              <option value="Tamil">Tamil (தமிழ்)</option>
              <option value="Hinglish">Hinglish (Conversational)</option>
            </select>
          </div>

          {/* Learning Time */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Learning Time
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium outline-none focus:border-cyan-400"
            >
              <option value={5}>5 Minutes (Quick Essential Mastery)</option>
              <option value={20}>20 Minutes (Standard Deep Dive)</option>
              <option value={60}>60 Minutes (Mastery Workshop)</option>
              <option value={10080}>7 Days (Curriculum Path)</option>
            </select>
          </div>

          {/* Teaching Style */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Teaching Style
            </label>
            <select
              value={teachingStyle}
              onChange={(e) => setTeachingStyle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium outline-none focus:border-cyan-400"
            >
              <option value="Visual">Visual (Circuits, Diagrams & Graphs)</option>
              <option value="Simple">Simple (Analogy First & Plain English)</option>
              <option value="Practical">Practical (Real-World Engineering Cases)</option>
              <option value="Socratic">Socratic (Guided Discovery Questions)</option>
              <option value="Exam-focused">Exam-focused (Formulas & Key Patterns)</option>
            </select>
          </div>

          {/* Learning Objective */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Learning Objective
            </label>
            <select
              value={learningObjective}
              onChange={(e) => setLearningObjective(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium outline-none focus:border-cyan-400"
            >
              <option value="Understand concept">Understand Concept Intuitively</option>
              <option value="Exam preparation">Exam Preparation & Problem Solving</option>
              <option value="Interview preparation">Interview Defense Preparation</option>
              <option value="Practical application">Practical Project Application</option>
              <option value="Revision">Rapid Revision & Diagnostics</option>
            </select>
          </div>

          {/* Desired Depth */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              Desired Depth
            </label>
            <select
              value={depth}
              onChange={(e) => setDepth(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium outline-none focus:border-cyan-400"
            >
              <option value="Quick">Quick Overview</option>
              <option value="Standard">Standard Progressive Mastery</option>
              <option value="Deep">Deep Dive with Edge Cases</option>
            </select>
          </div>

        </div>

        {/* Submit Actions */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition-all"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-7 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-500/25 flex items-center gap-2 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Designing Structured Lesson...</span>
              </>
            ) : (
              <>
                <span>Create My Lesson</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
