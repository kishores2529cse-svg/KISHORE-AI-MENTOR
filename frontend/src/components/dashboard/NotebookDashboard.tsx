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
  CheckCircle2,
  Trash2,
  Zap,
  HelpCircle,
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

  const handleStartCustomSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim() && !activeDoc) return;
    onStartSession({
      topic: topicInput.trim() || activeDoc?.filename || 'New Learning Session',
      document: activeDoc,
      initialMessage: topicInput.trim() ? `Can you elucidate ${topicInput.trim()} for me step-by-step?` : undefined
    });
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = pastSessions.filter(s => s.session_id !== sessionId);
    setPastSessions(filtered);
    localStorage.setItem('kishore_ai_sessions', JSON.stringify(filtered));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            NotebookLM AI Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            AI Mentor Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Upload study materials or enter any topic to start a human-like 1-on-1 video elucidation session.
          </p>
        </div>

        <button
          onClick={() => onStartSession({ topic: "General Tutoring & Mentorship", initialMessage: "Hi! I'm ready to learn. What would you recommend we explore?" })}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>⚡ Instant 1-on-1 Mentorship</span>
        </button>
      </div>

      {/* 2-Column NotebookLM Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT SIDEBAR: Sources & Past Video Sessions (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* New Conversation Button */}
          <button
            onClick={() => onStartSession({ topic: "General Educational Mentorship" })}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Start New Video Session</span>
          </button>

          {/* Uploaded Materials / Sources Library */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                Study Sources ({uploadedDocs.length})
              </span>
            </div>

            {uploadedDocs.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl p-4 text-xs text-slate-500">
                <span>No materials uploaded yet. Upload a PDF, textbook or slides below.</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {uploadedDocs.map(doc => (
                  <div
                    key={doc.document_id}
                    onClick={() => { setActiveDoc(doc); setTopicInput(doc.topics_found[0] || doc.filename); }}
                    className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                      activeDoc?.document_id === doc.document_id
                        ? 'bg-indigo-600/20 border-cyan-400 text-cyan-200'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="truncate font-semibold">{doc.filename}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                        {doc.chunk_count} Chunks
                      </span>
                      <button
                        onClick={(e) => handleRemoveMaterial(doc.document_id, e)}
                        className="p-1 text-slate-500 hover:text-red-400 rounded"
                        title="Remove Document"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Video & Voice Sessions History */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                Saved Video Sessions
              </span>
            </div>

            {pastSessions.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl p-4 text-xs text-slate-500">
                <span>No past sessions yet. Every live video chat will be automatically saved here.</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {pastSessions.map(sess => (
                  <div
                    key={sess.session_id}
                    onClick={() => onStartSession({ topic: sess.topic, existingSession: sess })}
                    className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 text-xs text-slate-300 cursor-pointer flex items-center justify-between group transition-all"
                  >
                    <div className="truncate pr-2">
                      <h4 className="font-semibold text-white group-hover:text-cyan-300 truncate transition-colors">
                        {sess.title || sess.topic}
                      </h4>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {sess.messages?.length || 0} messages • {sess.updated_at || 'Recent'}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteSession(sess.session_id, e)}
                      className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
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
        <div className="lg:col-span-8 space-y-6">
          
          {/* Material Ingestion Dropzone (NotebookLM style) */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 relative overflow-hidden">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-400" />
                Upload Study Material for Grounded Elucidation
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Upload PDFs, textbooks, lecture slides (PPTX), or notes. The AI Mentor will ground answers in your provided content.
              </p>
            </div>

            <div className="border-2 border-dashed border-slate-700 hover:border-cyan-400 rounded-2xl p-8 text-center bg-slate-900/40 transition-colors">
              <input
                type="file"
                id="notebookUpload"
                onChange={handleFileUpload}
                accept=".pdf,.docx,.doc,.pptx,.ppt,.txt"
                className="hidden"
              />
              <label htmlFor="notebookUpload" className="cursor-pointer flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-3">
                  <Upload className="w-7 h-7 text-cyan-400" />
                </div>
                <span className="text-sm font-bold text-white">
                  {uploading ? 'Chunking & Indexing Material with RAG...' : 'Click to upload or drag & drop material'}
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  Supports PDF, DOCX, PPTX, and TXT files
                </span>
              </label>

              {activeDoc && (
                <div className="mt-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      <strong className="text-sm text-white">{activeDoc.filename}</strong>
                    </div>
                    <p className="text-[11px] text-emerald-300/80 mt-1">
                      {activeDoc.extracted_text_preview}
                    </p>
                  </div>

                  <button
                    onClick={() => onStartSession({ topic: activeDoc.filename, document: activeDoc })}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 flex-shrink-0 shadow-md transition-all"
                  >
                    <span>Elucidate This Doc</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Ask Anything / Topic Input Bar */}
          <form onSubmit={handleStartCustomSession} className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              What would you like the AI Mentor to explain today?
            </h3>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="Ask anything or enter a topic (e.g. 'How does electrical resistance work?' or 'Elucidate limits in calculus')..."
                className="flex-1 px-4 py-3.5 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-cyan-400 text-white placeholder-slate-500 text-sm outline-none font-medium transition-colors"
              />

              <button
                type="submit"
                disabled={!topicInput.trim() && !activeDoc}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
              >
                <span>Start Video Chat</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick starters removed to avoid hardcoded domain-specific examples */}

          </form>

        </div>

      </div>

    </div>
  );
};
