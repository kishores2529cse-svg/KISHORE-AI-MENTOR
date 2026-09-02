import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneOff,
  Sparkles,
  BookOpen,
  FileCheck,
  RotateCcw,
  Send,
  Radio,
  Sliders,
  CheckCircle2,
  Cpu,
  AudioWaveform as WaveformIcon,
  AlertTriangle
} from 'lucide-react';
import katex from 'katex';
import { api } from '../../services/api';
import { ChatMessage, ConversationSession, UploadResponse } from '../../types';
import { audioManager, AuthoritativeResponse } from '../../services/audioManager';
import { Avatar3D } from './Avatar3D';

interface RealTimeVoiceAgentProps {
  topic: string;
  document?: UploadResponse | null;
  existingSession?: ConversationSession | null;
  onEndCall: () => void;
}

interface VoiceOption {
  id: string;
  name: string;
  lang: string;
  gender: string;
  recommended: boolean;
  description: string;
}

const DEFAULT_VOICES: VoiceOption[] = [
  {
    id: "en-IN-PrabhatNeural",
    name: "Kishore S (Indian English - Mentor)",
    lang: "en-IN",
    gender: "Male",
    recommended: true,
    description: "Empathetic, clear, and natural pedagogical mentor voice."
  },
  {
    id: "en-IN-NeerjaNeural",
    name: "Priya (Indian English - Tutor)",
    lang: "en-IN",
    gender: "Female",
    recommended: false,
    description: "Warm, engaging, and articulate female academic voice."
  },
  {
    id: "en-US-ChristopherNeural",
    name: "Christopher (US English - Deep & Clear)",
    lang: "en-US",
    gender: "Male",
    recommended: false,
    description: "Deep, authoritative, and studio-grade American voice."
  },
  {
    id: "en-US-JennyNeural",
    name: "Jenny (US English - Expressive)",
    lang: "en-US",
    gender: "Female",
    recommended: false,
    description: "Clear, friendly, conversational US voice."
  },
  {
    id: "en-GB-RyanNeural",
    name: "Ryan (British English - Academic)",
    lang: "en-GB",
    gender: "Male",
    recommended: false,
    description: "Refined, articulate British accent for structured lessons."
  }
];

export const RealTimeVoiceAgent: React.FC<RealTimeVoiceAgentProps> = ({
  topic,
  document,
  existingSession,
  onEndCall
}) => {
  // Session & Chat history
  const [messages, setMessages] = useState<ChatMessage[]>(existingSession?.messages || []);
  const [sessionId] = useState(existingSession?.session_id || `voice_${Date.now().toString(36)}`);
  
  // Real-time Voice Agent state: 'listening' | 'processing' | 'speaking' | 'idle'
  const [agentState, setAgentState] = useState<'listening' | 'processing' | 'speaking' | 'idle'>('speaking');
  const [liveUserTranscript, setLiveUserTranscript] = useState<string>('');
  const [lastMentorSpoken, setLastMentorSpoken] = useState<string>('');
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [micPermissionDenied, setMicPermissionDenied] = useState<boolean>(false);
  const [manualInputText, setManualInputText] = useState<string>('');

  // Voice Customization & 3D Avatar
  const [avatarMode, setAvatarMode] = useState<'3d' | 'photo'>('3d');
  const [voiceList, setVoiceList] = useState<VoiceOption[]>(DEFAULT_VOICES);
  const [selectedVoice, setSelectedVoice] = useState<string>('en-IN-PrabhatNeural');
  const [showVoicePicker, setShowVoicePicker] = useState<boolean>(false);

  // Synchronized Whiteboard / Notes
  const [whiteboardNotes, setWhiteboardNotes] = useState<{
    title?: string;
    formula_latex?: string;
    bullet_points?: string[];
    analogy?: string;
  }>({
    title: document?.filename || topic || "Interactive Voice Call",
    formula_latex: undefined,
    bullet_points: [
      `Key fundamentals of ${topic || 'your chosen subject'}`,
      "Dynamic mechanisms and step-by-step intuition",
      "Practical real-world application"
    ],
    analogy: "Connecting ideas step-by-step to build deep intuition."
  });

  const recognitionRef = useRef<any>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const isMutedRef = useRef<boolean>(false);
  const accumulatedSpeechRef = useRef<string>('');
  const silenceTimerRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioUrlRef = useRef<string | null>(null);

  isMutedRef.current = isMicMuted;

  // Fetch available neural voices on mount
  useEffect(() => {
    api.getNeuralVoices().then((voices) => {
      if (voices && voices.length > 0) {
        setVoiceList(voices as VoiceOption[]);
      }
    }).catch(() => {});
  }, []);

  // Render KaTeX safely
  const renderFormula = (latex?: string) => {
    if (!latex) return { __html: '' };
    try {
      return { __html: katex.renderToString(latex, { throwOnError: false }) };
    } catch {
      return { __html: latex };
    }
  };

  // Stop any active neural speech audio or browser speech immediately
  const stopAllSpeechPlayback = () => {
    audioManager.stop();
    isSpeakingRef.current = false;
  };

  // High-Definition Neural Speech Playback via centralized authoritative AudioManager
  const speakMentorSpeech = (text: string, respId?: string, onSpeechEnd?: () => void) => {
    if (isAudioMuted) {
      if (onSpeechEnd) onSpeechEnd();
      return;
    }

    const currentVoiceObj = voiceList.find(v => v.id === selectedVoice);
    let lang = 'English';
    if (currentVoiceObj?.lang?.startsWith('ta')) lang = 'Tamil';
    else if (currentVoiceObj?.lang?.startsWith('hi')) lang = 'Hindi';

    const authoritativeResp: AuthoritativeResponse = {
      response_id: respId || `resp_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      text: text,
      spoken_text: text,
      voice: selectedVoice,
      language: lang,
      timestamp: Date.now()
    };

    setAgentState('speaking');
    stopListening();

    audioManager.playResponse(authoritativeResp, {
      onStart: () => {
        isSpeakingRef.current = true;
        setAgentState('speaking');
      },
      onEnd: () => {
        isSpeakingRef.current = false;
        setAgentState('listening');
        if (onSpeechEnd) onSpeechEnd();
        if (!isMutedRef.current) {
          startContinuousListening();
        }
      },
      onError: () => {
        isSpeakingRef.current = false;
        setAgentState('listening');
        if (onSpeechEnd) onSpeechEnd();
        if (!isMutedRef.current) {
          startContinuousListening();
        }
      }
    });
  };

  // Graceful browser fallback if server audio synthesis is unreachable
  const fallbackBrowserSynthesis = (text: string, onSpeechEnd?: () => void) => {
    if (!('speechSynthesis' in window) || isAudioMuted) {
      isSpeakingRef.current = false;
      setAgentState('listening');
      if (onSpeechEnd) onSpeechEnd();
      if (!isMutedRef.current) startContinuousListening();
      return;
    }

    window.speechSynthesis.cancel();
    const cleanSpoken = text.replace(/[*#`_$\\]/g, ' ').trim();
    const utterance = new SpeechSynthesisUtterance(cleanSpoken);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Guy')) && v.lang.startsWith('en')) || voices.find(v => v.lang.startsWith('en'));
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => {
      isSpeakingRef.current = true;
      setAgentState('speaking');
    };

    utterance.onend = () => {
      isSpeakingRef.current = false;
      setAgentState('listening');
      if (onSpeechEnd) onSpeechEnd();
      if (!isMutedRef.current) startContinuousListening();
    };

    utterance.onerror = () => {
      isSpeakingRef.current = false;
      setAgentState('listening');
      if (!isMutedRef.current) startContinuousListening();
    };

    window.speechSynthesis.speak(utterance);
  };

  // INSTANT REAL-TIME STREAMING SPEECH RECOGNITION (Word-by-word Live Display)
  const startContinuousListening = () => {
    if (isSpeakingRef.current || isMutedRef.current) return;
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      
      const currentVoiceObj = voiceList.find(v => v.id === selectedVoice);
      recognition.lang = currentVoiceObj?.lang || 'en-IN';

      recognition.onstart = () => {
        setAgentState('listening');
        setMicPermissionDenied(false);
      };

      recognition.onresult = (event: any) => {
        // INSTANT BARGE-IN: If student speaks even one word while mentor is talking, stop mentor immediately!
        if (isSpeakingRef.current) {
          stopAllSpeechPlayback();
        }

        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const liveText = (finalTranscript || interimTranscript || '').trim();
        if (liveText) {
          // LIVE UPDATE IMMEDIATELY (<20ms): The user sees their words as they speak!
          accumulatedSpeechRef.current = liveText;
          setLiveUserTranscript(liveText);
          setAgentState('listening');

          // Reset silence timer on every spoken syllable/word
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }

          // Auto-submit after natural 850ms speech pause
          silenceTimerRef.current = setTimeout(() => {
            if (accumulatedSpeechRef.current.trim().length > 1) {
              const textToSubmit = accumulatedSpeechRef.current.trim();
              accumulatedSpeechRef.current = '';
              setLiveUserTranscript('');
              handleStudentVoiceSpoke(textToSubmit);
            }
          }, 850);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicPermissionDenied(true);
        }
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.warn('Speech recognition warning:', event.error);
        }
        if (!isSpeakingRef.current && !isMutedRef.current && event.error !== 'not-allowed') {
          setTimeout(() => {
            if (!isSpeakingRef.current && !isMutedRef.current) {
              try { recognition.start(); } catch {}
            }
          }, 300);
        }
      };

      recognition.onend = () => {
        // If there was speech pending when the stream cycled, submit it immediately
        if (accumulatedSpeechRef.current.trim().length > 1) {
          const textToSubmit = accumulatedSpeechRef.current.trim();
          accumulatedSpeechRef.current = '';
          setLiveUserTranscript('');
          handleStudentVoiceSpoke(textToSubmit);
        } else if (!isSpeakingRef.current && !isMutedRef.current && !micPermissionDenied) {
          setTimeout(() => {
            if (!isSpeakingRef.current && !isMutedRef.current) {
              try { recognition.start(); } catch {}
            }
          }, 200);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Could not start live speech recognition:', e);
    }
  };

  const stopListening = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
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
      summary: `Live voice session on ${topic} with ${updatedMessages.length} spoken exchanges.`
    };
    const local = localStorage.getItem('kishore_ai_sessions');
    const list: ConversationSession[] = local ? JSON.parse(local) : [];
    const filtered = list.filter(s => s.session_id !== sessionId);
    localStorage.setItem('kishore_ai_sessions', JSON.stringify([sessionObj, ...filtered]));
    api.saveSession(sessionObj).catch(() => {});
  };

  // Handle student voice submission
  const handleStudentVoiceSpoke = async (spokenText: string) => {
    if (!spokenText.trim()) return;
    stopListening();
    setAgentState('processing');

    const userMsg: ChatMessage = {
      id: `voice_${Date.now()}_u`,
      role: 'user',
      content: spokenText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setManualInputText('');

    try {
      const res = await api.sendChatMessage({
        session_id: sessionId,
        message: spokenText,
        document_id: document?.document_id,
        topic: topic,
        history: newHistory
      });

      const mentorScript = res.spoken_script || res.message;
      const aiMsg: ChatMessage = {
        id: `voice_${Date.now()}_a`,
        role: 'assistant',
        content: res.message,
        spoken_script: mentorScript,
        visual_notes: res.visual_notes,
        citations: res.citations,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalMessages = [...newHistory, aiMsg];
      setMessages(finalMessages);
      persistSession(finalMessages);

      if (res.visual_notes) setWhiteboardNotes(res.visual_notes);
      setLastMentorSpoken(mentorScript);

      // Mentor speaks neural reply aloud, then resumes listening automatically!
      speakMentorSpeech(mentorScript, (res as any).response_id);

    } catch (e) {
      console.error("Chat message error:", e);
      const fallbackScript = `I hear you! Regarding "${spokenText}", the key intuition is understanding how variables influence each other in real life.`;
      const fallbackMsg: ChatMessage = {
        id: `voice_${Date.now()}_a`,
        role: 'assistant',
        content: fallbackScript,
        spoken_script: fallbackScript,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const finalMessages = [...newHistory, fallbackMsg];
      setMessages(finalMessages);
      persistSession(finalMessages);
      setLastMentorSpoken(fallbackScript);
      speakMentorSpeech(fallbackScript);
    }
  };

  // On mount: Welcome greeting + start continuous voice loop
  useEffect(() => {
    const docName = document?.filename;
    const targetSubject = docName || topic;
    const isSpecificSubject = targetSubject && 
      targetSubject !== 'General Educational Mentorship' && 
      targetSubject !== 'General Tutoring & Mentorship' &&
      targetSubject !== 'New Conversation';

    const greeting = isSpecificSubject
      ? `Hi! I'm Kishore S, your AI Mentor. I'm listening—ask me anything about ${targetSubject} and let's explore it together!`
      : "Hi! I'm Kishore S, your personal AI Mentor. I'm listening—ask me any question, or upload your study material, and let's explore it together!";
    
    setLastMentorSpoken(greeting);

    speakMentorSpeech(greeting, undefined, () => {
      startContinuousListening();
    });

    return () => {
      stopListening();
      stopAllSpeechPlayback();
    };
  }, []);

  // Toggle Mute
  const handleToggleMic = () => {
    if (isMicMuted) {
      setIsMicMuted(false);
      startContinuousListening();
    } else {
      setIsMicMuted(true);
      stopListening();
      setAgentState('idle');
    }
  };

  // Immediate Send Button if user wants instant submit without pause
  const handleInstantSubmit = () => {
    if (liveUserTranscript.trim().length > 0) {
      const text = liveUserTranscript.trim();
      accumulatedSpeechRef.current = '';
      setLiveUserTranscript('');
      handleStudentVoiceSpoke(text);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInputText.trim().length > 0) {
      handleStudentVoiceSpoke(manualInputText.trim());
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 space-y-5">
      
      {/* Top Call HUD Header */}
      <div className="glass-panel rounded-2xl px-6 py-4 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-4 shadow-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/80">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="w-3 h-3 rounded-full bg-emerald-400 block" />
            <span className="w-3 h-3 rounded-full bg-emerald-400 absolute inset-0 animate-ping opacity-75" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-cyan-300">
                LIVE REAL-TIME 1-ON-1 VOICE CALL
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <WaveformIcon className="w-3 h-3 text-emerald-400" />
                Live Streaming Subtitles + Neural Voice
              </span>
              {document && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <FileCheck className="w-3 h-3" />
                  {document.filename}
                </span>
              )}
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              {topic}
            </h1>
          </div>
        </div>

        {/* Status Indicator & Voice Persona Selector */}
        <div className="flex items-center gap-3">
          
          {/* Voice Persona Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowVoicePicker(!showVoicePicker)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-200 hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all"
              title="Change Mentor Voice"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Voice: {voiceList.find(v => v.id === selectedVoice)?.name.split(' ')[0] || 'Kishore'}</span>
            </button>

            {showVoicePicker && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-indigo-500/40 rounded-2xl p-2 shadow-2xl z-50 space-y-1">
                <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Select Studio Neural Voice
                </div>
                {voiceList.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVoice(v.id);
                      setShowVoicePicker(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-center justify-between ${
                      selectedVoice === v.id
                        ? 'bg-indigo-600/30 border border-indigo-500/50 text-white font-bold'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold flex items-center gap-1.5">
                        <span>{v.name}</span>
                        {v.recommended && (
                          <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-bold">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">{v.description}</div>
                    </div>
                    {selectedVoice === v.id && (
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Live Status Badge */}
          <div className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-indigo-500/40 text-xs font-bold flex items-center gap-2 shadow-inner">
            {agentState === 'speaking' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-cyan-300">Speaking Natural Voice...</span>
              </>
            ) : agentState === 'listening' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-300">Live Listening (Speak Now)</span>
              </>
            ) : agentState === 'processing' ? (
              <>
                <div className="w-2.5 h-2.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-indigo-300">Thinking & Formulating...</span>
              </>
            ) : (
              <span className="text-slate-400">Microphone Muted</span>
            )}
          </div>

          <button
            onClick={() => {
              stopAllSpeechPlayback();
              onEndCall();
            }}
            className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <PhoneOff className="w-4 h-4 text-red-400" />
            <span>End Call</span>
          </button>
        </div>
      </div>

      {/* Mic Permission / Insecure Origin Warning Banner if applicable */}
      {micPermissionDenied && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-3 shadow-lg animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div className="flex-1">
            <span className="font-bold block">Microphone Access Blocked or Origin Insecure</span>
            <span>If accessing via IP address (e.g. <code className="bg-amber-950/60 px-1 py-0.5 rounded">10.20.20.239</code>), please open <strong className="text-amber-100 underline">http://localhost:5173</strong> or enable microphone permissions in your browser bar. You can also type your question below!</span>
          </div>
        </div>
      )}

      {/* Main Fullscreen Real-Time Voice Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT / CENTER: Fullscreen Human Avatar with Live Voice Aura (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 sm:p-8 border border-indigo-500/40 flex flex-col items-center justify-between min-h-[520px] relative overflow-hidden shadow-2xl bg-gradient-to-b from-slate-900 via-[#0a0f1d] to-slate-950">
          
          {/* Ambient Voice Pulse Rings */}
          <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-700 ${
            agentState === 'speaking' ? 'opacity-100' : 'opacity-20'
          }`}>
            <div className="w-80 h-80 rounded-full bg-cyan-500/15 animate-ping opacity-60" />
            <div className="w-96 h-96 rounded-full bg-indigo-500/10 animate-pulse" />
          </div>

          {/* Top Mentor Badge & 3D / Photo Mode Switcher */}
          <div className="z-10 text-center flex flex-col items-center gap-2">
            <div className="flex items-center justify-between w-full max-w-xs px-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Personal AI Mentor
              </span>

              {/* 3D vs Photo Avatar Toggle */}
              <div className="flex items-center bg-slate-900/90 p-0.5 rounded-full border border-slate-800 shadow-inner">
                <button
                  type="button"
                  onClick={() => setAvatarMode('3d')}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                    avatarMode === '3d'
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ⚡ 3D Avatar
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarMode('photo')}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                    avatarMode === 'photo'
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  👤 Photo
                </button>
              </div>
            </div>

            <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
              <span>Kishore S</span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30 font-semibold">
                {avatarMode === '3d' ? '3D Interactive Mentor' : 'Live Interactive Voice'}
              </span>
            </h2>
          </div>

          {/* Main 3D / Realistic Avatar Box */}
          <div className="relative my-auto flex flex-col items-center justify-center z-10 w-full max-w-sm">
            
            {/* 3D Avatar or Photo Container */}
            <div className={`relative w-64 h-64 sm:w-72 sm:h-72 rounded-[28px] p-1.5 transition-all duration-500 ${
              agentState === 'speaking'
                ? 'ring-8 ring-cyan-400/60 shadow-[0_0_60px_rgba(56,189,248,0.5)] scale-105'
                : agentState === 'listening'
                ? 'ring-4 ring-emerald-400/60 shadow-[0_0_40px_rgba(52,211,153,0.35)] scale-100'
                : 'ring-1 ring-slate-700'
            }`}>
              
              {avatarMode === '3d' ? (
                <Avatar3D
                  agentState={agentState}
                  spokenText={lastMentorSpoken}
                  isAudioMuted={isAudioMuted}
                />
              ) : (
                <div className="w-full h-full rounded-[22px] overflow-hidden bg-slate-950 relative shadow-2xl">
                  <img
                    src="/mentor_avatar.jpg"
                    alt="Kishore S"
                    className="w-full h-full object-cover object-top transition-transform duration-300"
                    style={{ transform: agentState === 'speaking' ? 'scale(1.04)' : 'scale(1)' }}
                    onError={(e: any) => { e.target.src = '/mentor_avatar.png'; }}
                  />

                  {/* Animated Studio Equalizer Bar */}
                  {agentState === 'speaking' && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-950/85 px-4 py-1.5 rounded-full border border-cyan-400/50 backdrop-blur-md shadow-lg">
                      <span className="w-1 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-6 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '120ms' }} />
                      <span className="w-1 h-4 bg-cyan-300 rounded-full animate-bounce" style={{ animationDelay: '240ms' }} />
                      <span className="w-1.5 h-7 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '360ms' }} />
                      <span className="w-1 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '480ms' }} />
                      <span className="text-[11px] font-extrabold text-cyan-200 ml-1.5">Speaking Neural Audio</span>
                    </div>
                  )}

                  {/* Student Listening Ripple */}
                  {agentState === 'listening' && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-950/85 px-4 py-1.5 rounded-full border border-emerald-400/50 backdrop-blur-md shadow-lg">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-[11px] font-extrabold text-emerald-300">Listening to your Voice...</span>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Live Subtitle Stream (Floating Voice Captions that update instantaneously) */}
            <div className="mt-4 max-w-lg w-full text-center px-4">
              {liveUserTranscript ? (
                <div className="p-3.5 rounded-2xl bg-emerald-500/15 border-2 border-emerald-400/60 text-emerald-100 text-xs sm:text-sm font-medium shadow-lg flex flex-col sm:flex-row items-center justify-between gap-2 animate-in fade-in duration-100">
                  <div className="text-left flex-1">
                    <span className="text-emerald-400 font-bold block text-[10px] uppercase flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Live Speaking (Hearing in Real-Time):
                    </span>
                    <span className="font-semibold text-emerald-200">"{liveUserTranscript}"</span>
                  </div>
                  <button
                    onClick={handleInstantSubmit}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 shadow-md flex-shrink-0 transition-transform active:scale-95"
                    title="Send speech immediately"
                  >
                    <span>Send Now</span>
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 text-slate-200 text-xs sm:text-sm leading-relaxed max-h-24 overflow-y-auto shadow-inner">
                  <span className="text-cyan-400 font-bold block text-[10px] uppercase mb-0.5">Kishore S:</span>
                  <p className="italic">"{lastMentorSpoken}"</p>
                </div>
              )}
            </div>

          </div>

          {/* Voice Call Controls Bar & Quick Text Bar */}
          <div className="z-10 w-full space-y-3 pt-2">
            
            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4">
              {/* Mic Toggle */}
              <button
                onClick={handleToggleMic}
                className={`p-4 rounded-2xl font-bold flex items-center gap-2 shadow-xl transition-all hover:scale-105 active:scale-95 ${
                  isMicMuted
                    ? 'bg-slate-800 border border-slate-700 text-slate-400'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-emerald-500/25 ring-2 ring-emerald-400'
                }`}
                title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
              >
                {isMicMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                <span className="text-xs">{isMicMuted ? 'Mic Off' : 'Mic Live'}</span>
              </button>

              {/* Audio Voice Output Mute */}
              <button
                onClick={() => {
                  if (!isAudioMuted) stopAllSpeechPlayback();
                  setIsAudioMuted(!isAudioMuted);
                }}
                className={`p-4 rounded-2xl border transition-all ${
                  !isAudioMuted
                    ? 'bg-slate-900 border-indigo-500/40 text-cyan-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
                title={isAudioMuted ? 'Unmute Mentor Audio' : 'Mute Mentor Audio'}
              >
                {isAudioMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>

              {/* Replay Last Speech Button */}
              <button
                onClick={() => speakMentorSpeech(lastMentorSpoken)}
                className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Repeat last explanation in natural neural voice"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
            </div>

            {/* Live Dual Input Box: Type OR Speak */}
            <form onSubmit={handleManualSubmit} className="flex items-center gap-2 max-w-lg mx-auto w-full">
              <input
                type="text"
                value={manualInputText}
                onChange={(e) => setManualInputText(e.target.value)}
                placeholder="Or type a question and press Enter..."
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-colors shadow-inner"
              />
              <button
                type="submit"
                disabled={!manualInputText.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95 flex-shrink-0"
              >
                <span>Ask</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>

        </div>

        {/* RIGHT: Live Synchronized Blackboard & Spoken Voice Exchange History (5 cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          
          {/* Synchronized KaTeX Whiteboard */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Live Whiteboard Notes
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">Auto-synced with voice</span>
            </div>

            {/* LaTeX Formula */}
            {whiteboardNotes?.formula_latex && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div
                  className="text-base font-bold text-cyan-300 overflow-x-auto"
                  dangerouslySetInnerHTML={renderFormula(whiteboardNotes.formula_latex)}
                />
              </div>
            )}

            {/* Bullet Points */}
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

            {/* Analogy */}
            {whiteboardNotes?.analogy && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                <strong className="block text-[10px] uppercase font-bold text-amber-300 mb-0.5">
                  💡 Intuitive Analogy:
                </strong>
                <span>{whiteboardNotes.analogy}</span>
              </div>
            )}
          </div>

          {/* Spoken Dialogue History Stream */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 flex-1 flex flex-col max-h-[300px] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Spoken Exchange Log ({messages.length})
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold">Real-Time Saved</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`p-3 rounded-xl text-xs ${
                    m.role === 'user'
                      ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-200 ml-4'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 mr-4'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 text-[10px] font-bold text-slate-400">
                    <span>{m.role === 'user' ? '🎙️ You (Live Spoken)' : '👨‍🏫 Kishore S'}</span>
                    <span>{m.timestamp}</span>
                  </div>
                  <p className="leading-relaxed">{m.spoken_script || m.content}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
