import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  RefreshCw,
  PhoneOff,
  Plus,
  BookOpen,
  Lightbulb,
  FileCheck,
  CheckCircle2,
  HelpCircle,
  Zap,
  ArrowRight
} from 'lucide-react';
import katex from 'katex';
import { api } from '../../services/api';
import { ChatMessage, ConversationSession, UploadResponse } from '../../types';
import { RealisticTeacherAvatar } from './RealisticTeacherAvatar';
import { audioManager, AuthoritativeResponse } from '../../services/audioManager';

interface InteractiveVideoTutorProps {
  topic: string;
  document?: UploadResponse | null;
  existingSession?: ConversationSession | null;
  initialMessage?: string;
  onEndSession: () => void;
  onNewSession: () => void;
}

export const InteractiveVideoTutor: React.FC<InteractiveVideoTutorProps> = ({
  topic,
  document,
  existingSession,
  initialMessage,
  onEndSession,
  onNewSession
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(existingSession?.messages || []);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(existingSession?.session_id || `sess_${Date.now().toString(36)}`);

  // Avatar & Voice states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [currentSpokenText, setCurrentSpokenText] = useState('');
  const [emotion, setEmotion] = useState('Elucidating');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Synchronized Whiteboard / Notes
  const [whiteboardNotes, setWhiteboardNotes] = useState<{
    title?: string;
    formula_latex?: string;
    bullet_points?: string[];
    analogy?: string;
  }>({
    title: document?.filename || topic || "Interactive Tutoring",
    formula_latex: undefined,
    bullet_points: [
      `Key foundations of ${topic || 'your study material'}`,
      "First-principles intuitive understanding",
      "Grounded real-world application"
    ],
    analogy: "Connecting core concepts step-by-step to build deep intuition."
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Speech synthesis helper via authoritative AudioManager
  const speakText = (text: string, respId?: string) => {
    if (!speechEnabled) return;
    const authoritativeResp: AuthoritativeResponse = {
      response_id: respId || `resp_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      text: text,
      spoken_text: text,
      language: 'English',
      timestamp: Date.now()
    };
    audioManager.playResponse(authoritativeResp, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false)
    });
  };

  // Helper to render KaTeX formula safely
  const renderFormula = (latex?: string) => {
    if (!latex) return { __html: '' };
    try {
      return { __html: katex.renderToString(latex, { throwOnError: false }) };
    } catch {
      return { __html: latex };
    }
  };

  // Save session to LocalStorage & Backend
  const persistSession = (updatedMessages: ChatMessage[]) => {
    const sessionObj: ConversationSession = {
      session_id: sessionId,
      title: topic,
      topic: topic,
      document_id: document?.document_id,
      filename: document?.filename,
      messages: updatedMessages,
      created_at: existingSession?.created_at || new Date().toLocaleTimeString(),
      updated_at: new Date().toLocaleTimeString(),
      summary: `Discussion on ${topic} with ${updatedMessages.length} exchanges.`
    };

    // Save to localStorage
    const local = localStorage.getItem('kishore_ai_sessions');
    const list: ConversationSession[] = local ? JSON.parse(local) : [];
    const filtered = list.filter(s => s.session_id !== sessionId);
    localStorage.setItem('kishore_ai_sessions', JSON.stringify([sessionObj, ...filtered]));

    // Async save to backend
    api.saveSession(sessionObj).catch(() => {});
  };

  // On mount: send initial message if new session
  useEffect(() => {
    if (messages.length === 0) {
      const initPrompt = initialMessage || `Hello Kishore! Can you elucidate ${topic} for me?`;
      handleSendMessage(initPrompt, true);
    }
  }, []);

  const handleSendMessage = async (textToSend?: string, isFirstGreeting = false) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = isFirstGreeting ? [userMsg] : [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await api.sendChatMessage({
        session_id: sessionId,
        message: text,
        document_id: document?.document_id,
        topic: topic,
        history: newHistory
      });

      const aiMsg: ChatMessage = {
        id: `msg_${Date.now()}_a`,
        role: 'assistant',
        content: res.message,
        spoken_script: res.spoken_script,
        visual_notes: res.visual_notes,
        citations: res.citations,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalMessages = [...newHistory, aiMsg];
      setMessages(finalMessages);
      persistSession(finalMessages);

      // Update whiteboard and speaking
      if (res.visual_notes) {
        setWhiteboardNotes(res.visual_notes);
      }
      setCurrentSpokenText(res.spoken_script || res.message);
      setEmotion(res.emotion || 'Elucidating');
      speakText(res.spoken_script || res.message, (res as any).response_id);

    } catch {
      // Fallback response
      const fallbackMsg: ChatMessage = {
        id: `msg_${Date.now()}_a`,
        role: 'assistant',
        content: `Let's break down this question: "${text}". The core intuition behind ${topic} is understanding how each variable acts as a cause-and-effect mechanism rather than a rigid formula.`,
        spoken_script: `Let's break down this concept. When you look at ${topic}, the fundamental principle connects directly to physical reality.`,
        visual_notes: {
          title: `Key Intuition: ${topic || 'Core Concept'}`,
          formula_latex: undefined,
          bullet_points: [
            `Understanding the mechanism of ${topic || 'the topic'}`,
            "Cause-and-effect relationship",
            "Practical application and intuition"
          ],
          analogy: "Connecting concepts systematically to build intuition."
        },
        citations: document ? [`Source: ${document.filename}`] : ["Kishore S Knowledge Base"],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalMessages = [...newHistory, fallbackMsg];
      setMessages(finalMessages);
      persistSession(finalMessages);
      setCurrentSpokenText(fallbackMsg.spoken_script!);
      speakText(fallbackMsg.spoken_script!);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Speech Recognition Mic Toggle
  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser. Please use text input.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (isListening) {
      if (recognitionRef.current) {
        try {
          const activeRec = recognitionRef.current;
          recognitionRef.current = null;
          activeRec.onresult = null;
          activeRec.onerror = null;
          activeRec.onend = null;
          activeRec.abort();
        } catch {}
      }
      setIsListening(false);
    } else {
      try {
        if (recognitionRef.current) {
          try { recognitionRef.current.abort(); } catch {}
        }
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputMessage(transcript);
          setIsListening(false);
          recognitionRef.current = null;
        };

        recognition.onerror = () => {
          setIsListening(false);
          recognitionRef.current = null;
        };

        recognition.onend = () => {
          setIsListening(false);
          recognitionRef.current = null;
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.warn("Speech recognition error:", err);
        setIsListening(false);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
      
      {/* Top Header Controls Bar */}
      <div className="glass-panel rounded-2xl px-5 py-3.5 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-violet-500 p-0.5 shadow-md">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {topic}
              </h1>
              {document && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <FileCheck className="w-3 h-3" />
                  {document.filename}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Interactive 1-on-1 AI Video Mentorship • Kishore S
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onNewSession}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Start fresh conversation"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>New Chat</span>
          </button>

          <button
            onClick={onEndSession}
            className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
            title="End and archive conversation"
          >
            <PhoneOff className="w-3.5 h-3.5 text-red-400" />
            <span>End Session</span>
          </button>
        </div>
      </div>

      {/* 2-Column Split: Video Avatar & Whiteboard (Left 5 cols) | ChatGPT Stream (Right 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* LEFT COLUMN: Realistic AI Video Avatar & Concept Blackboard (5 cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col">
          
          {/* Realistic Video Frame */}
          <div className="h-80 sm:h-96">
            <RealisticTeacherAvatar
              spokenText={currentSpokenText}
              isSpeaking={isSpeaking}
              emotion={emotion}
              speechEnabled={speechEnabled}
              onToggleSpeech={() => setSpeechEnabled(!speechEnabled)}
              topic={topic}
            />
          </div>

          {/* Synchronized Concept Blackboard & Notes */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex-1 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Live Whiteboard Notes
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">Auto-synced</span>
            </div>

            {/* LaTeX Equation */}
            {whiteboardNotes?.formula_latex && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div
                  className="text-base font-bold text-cyan-300 overflow-x-auto"
                  dangerouslySetInnerHTML={renderFormula(whiteboardNotes.formula_latex)}
                />
              </div>
            )}

            {/* Key Bullet Points */}
            {whiteboardNotes?.bullet_points && whiteboardNotes.bullet_points.length > 0 && (
              <ul className="space-y-1.5 text-xs text-slate-300">
                {whiteboardNotes.bullet_points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Physical Analogy */}
            {whiteboardNotes?.analogy && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                <strong className="block text-[10px] uppercase font-bold text-amber-300 mb-0.5">
                  💡 Intuitive Analogy:
                </strong>
                <span>{whiteboardNotes.analogy}</span>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: ChatGPT Style Multi-Turn Dialogue (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl border border-slate-800 flex flex-col h-[650px] sm:h-[750px] shadow-2xl overflow-hidden">
          
          {/* Messages Stream */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Mentor Photo avatar for assistant */}
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-cyan-400/40 flex-shrink-0 mt-1 shadow-sm">
                    <img src="/mentor_avatar.jpg" alt="Kishore S" className="w-full h-full object-cover object-top" />
                  </div>
                )}

                {/* Message Bubble */}
                <div className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-md ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-tr-none'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}>
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span className="font-bold text-[11px] text-slate-400">
                      {msg.role === 'user' ? 'You (Student)' : 'Kishore S (AI Mentor)'}
                    </span>
                    <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                  </div>

                  <p className="whitespace-pre-line text-slate-100">{msg.content}</p>

                  {/* Document Grounding Citations */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] text-emerald-400">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>{msg.citations.join(' • ')}</span>
                    </div>
                  )}

                  {/* Replay Audio button */}
                  {msg.role === 'assistant' && msg.spoken_script && (
                    <button
                      onClick={() => speakText(msg.spoken_script!)}
                      className="mt-2 text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold transition-colors"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Replay Voice</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-cyan-400/40 flex-shrink-0">
                  <img src="/mentor_avatar.jpg" alt="Kishore S" className="w-full h-full object-cover object-top" />
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span>Kishore S is elucidating your question...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Pedagogical Triggers */}
          <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-500 mr-1">Quick Prompts:</span>
            {[
              "Explain Differently",
              "Give Me an Example",
              "Make It Simpler",
              "Ask Me a Test Question"
            ].map(trigger => (
              <button
                key={trigger}
                onClick={() => handleSendMessage(`Can you please ${trigger.toLowerCase()}?`)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 transition-colors"
              >
                {trigger}
              </button>
            ))}
          </div>

          {/* Input Box Form */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask Kishore S anything or speak your response..."
                className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 text-white placeholder-slate-500 text-xs sm:text-sm outline-none font-medium transition-colors"
              />

              {/* Speech-to-text mic */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
                  isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-slate-400 hover:text-cyan-400'
                }`}
                title={isListening ? 'Listening...' : 'Speak with Microphone'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
