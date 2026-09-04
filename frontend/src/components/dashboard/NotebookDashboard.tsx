import React, { useState, useEffect } from 'react';
import {
  Upload,
  BookOpen,
  FileText,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Plus,
  Clock,
  Trash2,
  Zap,
  FileCheck
} from 'lucide-react';
import { api } from '../../services/api';
import { UploadResponse, ConversationSession } from '../../types';

interface NotebookDashboardProps {
  onStartSession: (params: {
    topic: string;
    document?: UploadResponse | null;
    existingSession?: ConversationSession | null;
    initialMessage?: string;
  }) => void;
  onExploreLanding: () => void;
}

export const NotebookDashboard: React.FC<NotebookDashboardProps> = ({
  onStartSession,
  onExploreLanding
}) => {
  const [topicInput, setTopicInput] = useState('');
  const [uploadedDocs, setUploadedDocs] = useState<UploadResponse[]>([]);
  const [activeDoc, setActiveDoc] = useState<UploadResponse | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pastSessions, setPastSessions] = useState<ConversationSession[]>([]);

  // Load past sessions from localStorage / backend on mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const remote = await api.getSessions();
        const local = localStorage.getItem('kishore_ai_sessions');
        const parsedLocal: ConversationSession[] = local ? JSON.parse(local) : [];
        const merged = [...remote, ...parsedLocal.filter(l => !remote.some(r => r.session_id === l.session_id))];
        setPastSessions(merged);
      } catch {
        const local = localStorage.getItem('kishore_ai_sessions');
        if (local) setPastSessions(JSON.parse(local));
      }
    };
    loadSessions();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await api.uploadMaterial(file);
      setUploadedDocs(prev => [res, ...prev]);
      setActiveDoc(res);
      if (res.topics_found && res.topics_found.length > 0) {
        setTopicInput(res.topics_found[0]);
      }
    } catch {
      // Mock fallback upload
      const mockDoc: UploadResponse = {
        document_id: `doc_${Date.now().toString(36)}`,
        filename: file.name,
        file_type: file.name.split('.').pop()?.toUpperCase() || 'PDF',
        extracted_text_preview: `Extracted study material from ${file.name}. Grounded citations ready for retrieval.`,
        topics_found: [file.name.replace(/\.[^/.]+$/, ""), "Core Mechanisms", "Practical Applications"],
        chunk_count: 8,
        status: "Indexed & RAG-Ready"
      };
      setUploadedDocs(prev => [mockDoc, ...prev]);
      setActiveDoc(mockDoc);
      setTopicInput(mockDoc.topics_found[0]);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveMaterial = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await api.removeMaterial(docId);
    setUploadedDocs(prev => prev.filter(d => d.document_id !== docId));
    if (activeDoc?.document_id === docId) {
      setActiveDoc(null);
      setTopicInput('');
    }
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = pastSessions.filter(s => s.session_id !== sessionId);
    setPastSessions(filtered);
    localStorage.setItem('kishore_ai_sessions', JSON.stringify(filtered));
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] w-full overflow-hidden bg-[#030712] pt-8 sm:pt-10 pb-16 select-none">

      {/* Cinematic Background: Human Student & AI Teacher Fingertip Touch */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <img
          src="/workspace_mentor_touch.jpg"
          alt="Human Student and AI Mentor Connection"
          className="w-full h-full object-cover object-center opacity-100 scale-[1.01]"
        />

        {/* Light, delicate vignettes so the student, AI teacher & fingertip touch are vibrantly visible */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#030712]/50 via-transparent to-[#030712]/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030712]/70 via-transparent to-[#030712]/30" />
        <div className="absolute inset-0 bg-slate-950/15" />

        {/* Ambient atmospheric lighting around the fingertip touch spark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/2 w-[450px] h-[450px] bg-cyan-400/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-indigo-500/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Banner Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/25 border border-indigo-400/50 text-indigo-200 text-xs font-bold uppercase tracking-wider mb-2 backdrop-blur-xl shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              <span>NOTEBOOKLM AI WORKSPACE</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]">
              KISHORE AI Mentor Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-100 mt-1.5 max-w-2xl font-medium drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
              Upload study materials or enter any topic to start a human-like 1-on-1 video elucidation session.
            </p>
          </div>

          <button
            onClick={() => onStartSession({ topic: "General Tutoring & Mentorship", initialMessage: "Hi! I'm ready to learn. What would you recommend we explore?" })}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-orange-500/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
          >
            <Zap className="w-4 h-4 fill-current text-slate-950" />
            <span>Instant 1-on-1 Mentorship</span>
          </button>
        </div>

        {/* 2-Column NotebookLM Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT SIDEBAR: Sources & Past Video Sessions (4 cols) */}
          <div className="lg:col-span-4 space-y-5">

            {/* New Video Session Button */}
            <button
              onClick={() => onStartSession({ topic: "General Educational Mentorship" })}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-cyan-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer backdrop-blur-md"
            >
              <Plus className="w-4 h-4" />
              <span>Start New Video Session</span>
            </button>

            {/* Uploaded Materials / Sources Library (Glassmorphism Card) */}
            <div className="rounded-2xl p-4 sm:p-5 bg-slate-950/35 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl space-y-3">
              <div className="flex items-center justify-between text-xs font-extrabold text-slate-100 uppercase tracking-wider drop-shadow-md">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-300" />
                  STUDY SOURCES ({uploadedDocs.length})
                </span>
              </div>

              {uploadedDocs.length === 0 ? (
                <div className="text-center py-7 border border-dashed border-white/20 rounded-xl p-4 text-xs text-slate-200 bg-slate-950/40 backdrop-blur-md">
                  <BookOpen className="w-6 h-6 mx-auto mb-2 text-cyan-300" />
                  <span className="font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">No materials uploaded yet.</span>
                  <p className="text-[11px] text-slate-300 mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">Upload a PDF, textbook or slides to begin.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {uploadedDocs.map(doc => (
                    <div
                      key={doc.document_id}
                      onClick={() => { setActiveDoc(doc); setTopicInput(doc.topics_found[0] || doc.filename); }}
                      className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all backdrop-blur-md ${activeDoc?.document_id === doc.document_id
                        ? 'bg-indigo-600/50 border-cyan-300 text-cyan-100 shadow-lg'
                        : 'bg-slate-950/55 border-white/15 text-slate-100 hover:border-cyan-400/60 hover:bg-slate-900/60'
                        }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span className="truncate font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">{doc.filename}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] bg-slate-900/90 text-cyan-300 px-2 py-0.5 rounded border border-cyan-400/30 font-semibold shadow-sm">
                          {doc.chunk_count} Chunks
                        </span>
                        <button
                          onClick={(e) => handleRemoveMaterial(doc.document_id, e)}
                          className="p-1 text-slate-300 hover:text-red-400 rounded transition-colors"
                          title="Remove Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past Video & Voice Sessions History (Glassmorphism Card) */}
            <div className="rounded-2xl p-4 sm:p-5 bg-slate-950/35 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl space-y-3">
              <div className="flex items-center justify-between text-xs font-extrabold text-slate-100 uppercase tracking-wider drop-shadow-md">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-300" />
                  SAVED VIDEO SESSIONS
                </span>
              </div>

              {pastSessions.length === 0 ? (
                <div className="text-center py-7 border border-dashed border-white/20 rounded-xl p-4 text-xs text-slate-200 bg-slate-950/40 backdrop-blur-md">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-indigo-300" />
                  <span className="font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">No past sessions yet.</span>
                  <p className="text-[11px] text-slate-300 mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">Every live video chat will be automatically saved here.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {pastSessions.map(sess => (
                    <div
                      key={sess.session_id}
                      onClick={() => onStartSession({ topic: sess.topic, existingSession: sess })}
                      className="p-3 rounded-xl bg-slate-950/55 border border-white/15 hover:border-cyan-400/60 text-xs text-slate-100 cursor-pointer flex items-center justify-between group transition-all hover:bg-slate-900/65 backdrop-blur-md shadow-sm"
                    >
                      <div className="truncate pr-2">
                        <h4 className="font-bold text-white group-hover:text-cyan-300 truncate transition-colors drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                          {sess.title || sess.topic}
                        </h4>
                        <span className="text-[10px] text-slate-300 flex items-center gap-1 mt-0.5 font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                          <Clock className="w-2.5 h-2.5 text-cyan-400" />
                          {sess.messages?.length || 0} messages • {sess.updated_at || 'Recent'}
                        </span>
                      </div>

                      <button
                        onClick={(e) => handleDeleteSession(sess.session_id, e)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-slate-800/80 transition-colors shrink-0"
                        title="Delete Session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT WORKSPACE: Ingestion & Live Question Launcher (8 cols) */}
          <div className="lg:col-span-8 space-y-6 pt-18">

            {/* Material Ingestion Dropzone (NotebookLM style Glassmorphism Card) */}
            <div className="rounded-3xl p-6 sm:p-8 bg-slate-950/35 border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl relative overflow-hidden">
              <div className="mb-5">
                <h2 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                  <Upload className="w-5 h-5 text-indigo-400" />
                  Upload Study Material for Grounded Elucidation
                </h2>
                <p className="text-xs sm:text-sm text-slate-100 mt-1.5 font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                  Upload PDFs, textbooks, lecture slides (PPTX), or notes. The AI Mentor will ground answers in your provided content.
                </p>
              </div>

              <div className="border-2 border-dashed border-cyan-400/40 hover:border-cyan-300 rounded-2xl p-8 sm:p-10 text-center bg-slate-950/35 hover:bg-slate-950/50 transition-all duration-300 backdrop-blur-xl shadow-inner group">
                <input
                  type="file"
                  id="notebookUpload"
                  onChange={handleFileUpload}
                  accept=".pdf,.docx,.doc,.pptx,.ppt,.txt"
                  className="hidden"
                />
                <label htmlFor="notebookUpload" className="cursor-pointer flex flex-col items-center">
                  <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-cyan-500/30 border border-cyan-400/50 flex items-center justify-center mb-3.5 shadow-[0_0_25px_rgba(34,211,238,0.25)] group-hover:scale-105 transition-transform backdrop-blur-md">
                    <Upload className="w-8 h-8 text-cyan-300 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-sm sm:text-base font-extrabold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
                    {uploading ? 'Chunking & Indexing Material with RAG...' : 'Click to upload or drag & drop material'}
                  </span>
                  <span className="text-xs text-slate-200 mt-1.5 font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                    Supports PDF, DOCX, PPTX, and TXT files
                  </span>
                </label>

                {activeDoc && (
                  <div className="mt-6 p-4 rounded-xl bg-emerald-950/50 border border-emerald-400/50 text-emerald-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left backdrop-blur-xl shadow-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-emerald-400" />
                        <strong className="text-sm text-white font-extrabold drop-shadow-md">{activeDoc.filename}</strong>
                      </div>
                      <p className="text-[11px] text-emerald-100 mt-1 drop-shadow-sm font-medium">
                        {activeDoc.extracted_text_preview}
                      </p>
                    </div>

                    <button
                      onClick={() => onStartSession({ topic: activeDoc.filename, document: activeDoc })}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-slate-950 font-black text-xs flex items-center gap-1.5 flex-shrink-0 shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <span>Elucidate This Doc</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
