import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  MicOff,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Award,
  Layers,
  Clock,
  Zap,
  CheckCircle2,
  TrendingUp,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Square,
  BookOpen,
  Lightbulb,
  Sliders,
  Flame,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { LessonPlan, StudentState, TeacherExplanation, AnswerEvaluation, AdaptiveAction, Question } from '../../types';
import { TeacherAvatar } from './TeacherAvatar';
import { VisualEngine } from './VisualEngine';
import { audioManager, AuthoritativeResponse } from '../../services/audioManager';

interface ClassroomPageProps {
  lessonPlan: LessonPlan;
  onFinishLesson: () => void;
}

export const ClassroomPage: React.FC<ClassroomPageProps> = ({
  lessonPlan,
  onFinishLesson
}) => {
  // Lesson state
  const [studentState, setStudentState] = useState<StudentState>({
    student_level: lessonPlan.level,
    language: lessonPlan.language,
    current_topic: lessonPlan.topic,
    current_concept_index: 0,
    current_concept: lessonPlan.concepts[0] || lessonPlan.topic,
    mastery: { [lessonPlan.concepts[0] || lessonPlan.topic]: 0.42 },
    misconceptions: [],
    difficulty: 'easy',
    teaching_strategy: lessonPlan.teaching_style.toLowerCase(),
    lesson_progress: 25,
    attempts: 0,
    last_action: 'start'
  });

  const [explanation, setExplanation] = useState<TeacherExplanation>({
    concept: lessonPlan.concepts[0] || lessonPlan.topic,
    teaching_style: lessonPlan.teaching_style,
    spoken_text: `Welcome to our interactive lesson on ${lessonPlan.topic}! Let's master this step-by-step so you build true intuition rather than memorizing formulas.`,
    bullet_points: [
      `Key physical mechanisms of ${lessonPlan.concepts[0] || lessonPlan.topic}`,
      "Dynamic variable relationships and step-by-step intuition",
      "Practical engineering and real-world application"
    ],
    analogy: "Like interconnected mechanisms working together in perfect balance.",
    practical_example: "Everyday technology relies on these core fundamentals to operate predictably.",
    visual_spec: {
      type: lessonPlan.topic.toLowerCase().includes('circuit') || lessonPlan.topic.toLowerCase().includes('ohm') ? 'circuit' : 'diagram',
      title: `${lessonPlan.topic} Fundamentals`
    },
    grounded_in_rag: false,
    suggested_question: {
      question_id: "q_init",
      concept: lessonPlan.concepts[0] || lessonPlan.topic,
      question: `In ${lessonPlan.concepts[0] || lessonPlan.topic}, what happens when the primary controlling variable is adjusted?`,
      question_type: "conceptual",
      expected_answer: "The dependent variables respond according to the fundamental physical relationship.",
      acceptable_variations: ["decreases", "increases", "proportional", "changes"],
      difficulty: "easy",
      misconception_mapping: {},
      hints: ["Think about cause and effect in the underlying physical system."]
    }
  });

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(explanation.suggested_question || null);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [isNextLoading, setIsNextLoading] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<AnswerEvaluation | null>(null);

  // Authoritative Teacher Response
  const [activeResponse, setActiveResponse] = useState<AuthoritativeResponse | null>(null);

  // Avatar & Speech states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [isAudioPaused, setIsAudioPaused] = useState(false);
  const [emotion, setEmotion] = useState<'explaining' | 'encouraging' | 'diagnostic' | 'misconception' | 'celebrating'>('explaining');
  const [isListening, setIsListening] = useState(false);

  // Signature WOW Alert modal
  const [wowAlert, setWowAlert] = useState<{
    visible: boolean;
    misconception: string;
    oldStrategy: string;
    newStrategy: string;
  } | null>(null);

  /**
   * Dispatches and synchronizes authoritative teacher response across UI and TTS
   */
  const playAuthoritativeResponse = (
    text: string,
    responseId?: string,
    spokenText?: string,
    languageOverride?: string
  ) => {
    const lang = languageOverride || studentState.language || lessonPlan.language || 'English';
    const authoritativeResp: AuthoritativeResponse = {
      response_id: responseId || `resp_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      lesson_id: lessonPlan.lesson_id,
      text: text,
      spoken_text: spokenText || text,
      language: lang,
      timestamp: Date.now()
    };

    setActiveResponse(authoritativeResp);
    setIsAudioPaused(false);

    if (speechEnabled) {
      audioManager.playResponse(authoritativeResp, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => {
          setIsSpeaking(false);
          setIsAudioPaused(false);
        },
        onError: () => {
          setIsSpeaking(false);
          setIsAudioPaused(false);
        }
      });
    }
  };

  // On mount: start lesson from backend
  useEffect(() => {
    let isMounted = true;

    const initLesson = async () => {
      try {
        const exp = await api.startLesson(lessonPlan.lesson_id);
        if (!isMounted) return;
        setExplanation(exp);
        if (exp.suggested_question) {
          setCurrentQuestion(exp.suggested_question);
        }
        playAuthoritativeResponse(
          exp.spoken_text,
          exp.response_id,
          exp.spoken_text,
          exp.language || lessonPlan.language
        );
      } catch {
        if (!isMounted) return;
        playAuthoritativeResponse(
          explanation.spoken_text,
          undefined,
          explanation.spoken_text,
          lessonPlan.language
        );
      }
    };

    initLesson();

    return () => {
      isMounted = false;
      audioManager.stop();
    };
  }, [lessonPlan.lesson_id]);

  // Handle Speech Recognition Mic Toggle
  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser. Please use text input.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = lessonPlan.language === 'Hindi' ? 'hi-IN' : lessonPlan.language === 'Tamil' ? 'ta-IN' : 'en-US';

    if (!isListening) {
      setIsListening(true);
      recognition.start();
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setStudentAnswer(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    } else {
      recognition.stop();
      setIsListening(false);
    }
  };

  // Submit student answer to Evaluator & Adaptive Engine
  const handleSubmitAnswer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!studentAnswer.trim() || isEvaluating) return;

    setIsEvaluating(true);
    setEvaluationResult(null);

    try {
      const evalRes = await api.submitAnswer(lessonPlan.lesson_id, studentAnswer);
      setEvaluationResult(evalRes);

      if (!evalRes.correct) {
        // Misconception detected
        setEmotion('misconception');
        if (evalRes.misconception) {
          setWowAlert({
            visible: true,
            misconception: evalRes.misconception,
            oldStrategy: studentState.teaching_strategy,
            newStrategy: evalRes.next_strategy
          });
        }

        // Trigger adaptive pedagogical response
        const adaptAction = await api.triggerAdaptation(lessonPlan.lesson_id, evalRes);
        setStudentState(prev => ({
          ...prev,
          mastery: { ...prev.mastery, [prev.current_concept]: evalRes.new_mastery },
          teaching_strategy: adaptAction.strategy,
          last_action: 'adapted'
        }));

        if (adaptAction.new_question) {
          setCurrentQuestion(adaptAction.new_question);
        }

        const speech = adaptAction.teacher_speech || evalRes.teacher_feedback;
        setExplanation(prev => ({
          ...prev,
          spoken_text: speech,
          visual_spec: adaptAction.visual_update || prev.visual_spec
        }));

        playAuthoritativeResponse(
          speech,
          adaptAction.response_id || evalRes.response_id,
          speech,
          evalRes.language || studentState.language
        );

      } else {
        // Correct answer! Boost mastery and celebrate
        setEmotion('celebrating');
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        setStudentState(prev => ({
          ...prev,
          mastery: { ...prev.mastery, [prev.current_concept]: evalRes.new_mastery },
          lesson_progress: Math.min(100, prev.lesson_progress + 35),
          last_action: 'concept_mastered'
        }));

        playAuthoritativeResponse(
          evalRes.teacher_feedback,
          evalRes.response_id,
          evalRes.teacher_feedback,
          evalRes.language || studentState.language
        );
      }
    } catch {
      // Offline fallback
      const feedback = `Good effort analyzing ${studentState.current_concept}! Let's examine the cause-and-effect relationship step-by-step.`;
      setEmotion('explaining');
      playAuthoritativeResponse(feedback);
    } finally {
      setIsEvaluating(false);
      setStudentAnswer('');
    }
  };

  // Handle Pedagogical Action Trigger Buttons
  const handlePedagogicalAction = async (actionType: string) => {
    if (isActionLoading) return;
    setIsActionLoading(actionType);

    try {
      const exp = await api.triggerPedagogicalAction(lessonPlan.lesson_id, actionType);
      setExplanation(exp);
      if (exp.suggested_question) {
        setCurrentQuestion(exp.suggested_question);
      }
      playAuthoritativeResponse(
        exp.spoken_text,
        exp.response_id,
        exp.spoken_text,
        exp.language || studentState.language
      );
    } catch (err) {
      console.warn("Pedagogical action error:", err);
      const speechMap: Record<string, string> = {
        DONT_UNDERSTAND: `No problem at all! Let's take a step back and explore ${studentState.current_concept} using a simple everyday picture.`,
        EXPLAIN_DIFFERENTLY: `Let's change our perspective completely and explore ${studentState.current_concept} from first principles.`,
        GIVE_EXAMPLE: `Here is a concrete real-world application of ${studentState.current_concept}.`,
        MAKE_SIMPLER: `Let's strip away all complexity and look strictly at the core intuitive mechanism of ${studentState.current_concept}.`,
        MAKE_HARDER: `Let's elevate the challenge with an advanced edge case in ${studentState.current_concept}!`
      };
      const text = speechMap[actionType] || "Let's adapt our teaching approach.";
      setExplanation(prev => ({ ...prev, spoken_text: text }));
      playAuthoritativeResponse(text);
    } finally {
      setIsActionLoading(null);
    }
  };

  // Advance to next concept or assessment
  const handleNextStep = async () => {
    if (isNextLoading) return;
    setIsNextLoading(true);

    try {
      const res = await api.continueNext(lessonPlan.lesson_id);
      if (res.has_next && res.explanation) {
        setExplanation(res.explanation);
        if (res.explanation.suggested_question) {
          setCurrentQuestion(res.explanation.suggested_question);
        }
        setEvaluationResult(null);
        setStudentState(prev => ({
          ...prev,
          current_concept_index: prev.current_concept_index + 1,
          current_concept: res.current_concept || prev.current_concept,
          lesson_progress: res.progress || prev.lesson_progress
        }));
        playAuthoritativeResponse(
          res.explanation.spoken_text,
          res.explanation.response_id,
          res.explanation.spoken_text,
          res.explanation.language || studentState.language
        );
      } else {
        onFinishLesson();
      }
    } catch {
      onFinishLesson();
    } finally {
      setIsNextLoading(false);
    }
  };

  // Audio Control Handlers
  const handleToggleMute = () => {
    const nextMuted = !speechEnabled;
    setSpeechEnabled(nextMuted);
    audioManager.setMuted(!nextMuted);
    if (!nextMuted) {
      setIsSpeaking(false);
    }
  };

  const handlePauseResume = () => {
    if (isAudioPaused) {
      audioManager.resume();
      setIsAudioPaused(false);
      setIsSpeaking(true);
    } else {
      audioManager.pause();
      setIsAudioPaused(true);
      setIsSpeaking(false);
    }
  };

  const handleStopAudio = () => {
    audioManager.stop();
    setIsSpeaking(false);
    setIsAudioPaused(false);
  };

  const handleReplayAudio = () => {
    if (activeResponse) {
      playAuthoritativeResponse(
        activeResponse.text,
        activeResponse.response_id,
        activeResponse.spoken_text,
        activeResponse.language
      );
    }
  };

  const currMastery = Math.round((studentState.mastery[studentState.current_concept] || 0.42) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner: Concept & Global Progress */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-extrabold tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
              Live Lesson
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Concept {studentState.current_concept_index + 1} of {lessonPlan.concepts.length}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            {studentState.current_concept}
          </h1>
        </div>

        {/* Live Mastery Meter & Audio Controls */}
        <div className="flex flex-wrap items-center gap-4">
          
          {/* Audio Player Controls */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <button
              onClick={handleToggleMute}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                speechEnabled ? 'text-cyan-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-800'
              }`}
              title={speechEnabled ? 'Mute Audio' : 'Unmute Audio'}
            >
              {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={handlePauseResume}
              className="p-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
              title={isAudioPaused ? 'Resume Audio' : 'Pause Audio'}
            >
              {isAudioPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handleStopAudio}
              className="p-1.5 rounded-lg text-xs text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all"
              title="Stop Audio"
            >
              <Square className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleReplayAudio}
              className="p-1.5 rounded-lg text-xs text-slate-300 hover:text-cyan-300 hover:bg-slate-800 transition-all"
              title="Replay Current Explanation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mastery Score Badge */}
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Concept Mastery</div>
              <div className="text-sm font-black text-white flex items-center gap-1.5">
                <span>{currMastery}%</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                  currMastery >= 80 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {currMastery >= 80 ? 'Mastered' : 'Developing'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Dual Pane Classroom Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: Realistic AI Video Mentor & Pedagogical Action Bar (5 cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          
          <div className="flex-1">
            <TeacherAvatar
              spokenText={explanation.spoken_text}
              isSpeaking={isSpeaking}
              emotion={emotion}
              teachingStyle={studentState.teaching_strategy}
              speechEnabled={speechEnabled}
              onToggleSpeech={handleToggleMute}
            />
          </div>

          {/* 5-Action Pedagogical Adaptation Bar (Zero-Regen Instant Adaptation) */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-2.5 shadow-xl">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3 h-3 text-cyan-400" />
              <span>Adaptive Teaching Tools</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handlePedagogicalAction('EXPLAIN_DIFFERENTLY')}
                disabled={isActionLoading !== null}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-cyan-300 font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
              >
                {isActionLoading === 'EXPLAIN_DIFFERENTLY' ? (
                  <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                )}
                <span>Explain Differently</span>
              </button>

              <button
                onClick={() => handlePedagogicalAction('GIVE_EXAMPLE')}
                disabled={isActionLoading !== null}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-emerald-300 font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
              >
                {isActionLoading === 'GIVE_EXAMPLE' ? (
                  <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>Give Me an Example</span>
              </button>

              <button
                onClick={() => handlePedagogicalAction('MAKE_SIMPLER')}
                disabled={isActionLoading !== null}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-amber-300 font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
              >
                {isActionLoading === 'MAKE_SIMPLER' ? (
                  <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>Make It Simpler</span>
              </button>

              <button
                onClick={() => handlePedagogicalAction('MAKE_HARDER')}
                disabled={isActionLoading !== null}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-purple-300 font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
              >
                {isActionLoading === 'MAKE_HARDER' ? (
                  <div className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Flame className="w-3.5 h-3.5 text-purple-400" />
                )}
                <span>Make It Harder</span>
              </button>
            </div>

            <button
              onClick={() => handlePedagogicalAction('DONT_UNDERSTAND')}
              disabled={isActionLoading !== null}
              className="w-full p-2.5 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/30 text-indigo-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
            >
              {isActionLoading === 'DONT_UNDERSTAND' ? (
                <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              )}
              <span>I Don't Understand — Reset Intuition</span>
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: Interactive Visual Stage & Diagnostic Check (7 cols) */}
        <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
          
          {/* Visual Engine Stage */}
          <div className="flex-1">
            <VisualEngine
              visualSpec={explanation.visual_spec}
              concept={studentState.current_concept}
              bulletPoints={explanation.bullet_points || []}
              analogy={explanation.analogy}
              practicalExample={explanation.practical_example}
            />
          </div>

          {/* Key Bullet Takeaways */}
          {explanation.bullet_points && explanation.bullet_points.length > 0 && (
            <div className="glass-panel rounded-2xl p-4 border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-cyan-400" />
                <span>Key Intuitions</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {explanation.bullet_points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Diagnostic Check & Student Answer Submission */}
          {currentQuestion && (
            <div className="glass-panel rounded-2xl p-5 border border-indigo-500/30 space-y-3 bg-gradient-to-b from-slate-900/90 to-slate-950/90 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-cyan-400" />
                  Diagnostic Concept Check
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Difficulty: {currentQuestion.difficulty}
                </span>
              </div>

              <p className="text-sm font-semibold text-white leading-snug">
                {currentQuestion.question}
              </p>

              {/* Answer Input Bar */}
              <form onSubmit={handleSubmitAnswer} className="space-y-3 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={studentAnswer}
                    onChange={(e) => setStudentAnswer(e.target.value)}
                    placeholder="Type your explanation or click the microphone to speak..."
                    className="flex-1 bg-slate-950 border border-slate-700/80 focus:border-cyan-400 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition-all shadow-inner"
                    disabled={isEvaluating}
                  />

                  <button
                    type="button"
                    onClick={toggleSpeechRecognition}
                    className={`p-3 rounded-xl border transition-all ${
                      isListening
                        ? 'bg-red-500/20 border-red-500 text-red-300 animate-pulse ring-2 ring-red-400'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                    title={isListening ? 'Stop Mic' : 'Speak Answer via Mic'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <button
                    type="submit"
                    disabled={isEvaluating || !studentAnswer.trim()}
                    className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex-shrink-0"
                  >
                    {isEvaluating ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Evaluating...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Answer</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Evaluation Feedback Panel */}
              {evaluationResult && (
                <div className={`p-4 rounded-xl text-xs space-y-2 animate-in fade-in duration-200 border ${
                  evaluationResult.correct
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                    : 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                }`}>
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      {evaluationResult.correct ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Excellent Intuition!</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                          <span>Misconception Detected</span>
                        </>
                      )}
                    </span>
                    <span className="text-[10px] font-semibold bg-slate-950/60 px-2 py-0.5 rounded">
                      Confidence: {Math.round(evaluationResult.confidence * 100)}%
                    </span>
                  </div>

                  <p className="leading-relaxed">{evaluationResult.teacher_feedback || evaluationResult.reason}</p>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleNextStep}
                      disabled={isNextLoading}
                      className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-700 text-white font-bold rounded-lg flex items-center gap-1.5 transition-all text-xs"
                    >
                      {isNextLoading ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Advancing...</span>
                        </>
                      ) : (
                        <>
                          <span>Continue to Next Step</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* Signature WOW Misconception Pivot Alert Modal */}
      {wowAlert && wowAlert.visible && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full rounded-3xl p-6 sm:p-8 border-2 border-amber-500/50 space-y-5 bg-gradient-to-b from-slate-900 via-amber-950/20 to-slate-950 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Zap className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[10px] uppercase font-black text-amber-400 tracking-wider">
                SIGNATURE ADAPTIQ LEARNING PIVOT
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                Misconception Intercepted
              </h3>
              <p className="text-xs text-amber-200 mt-2 leading-relaxed">
                {wowAlert.misconception}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Previous Strategy:</span>
                <span className="font-semibold text-slate-300">{wowAlert.oldStrategy}</span>
              </div>
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span>Adaptive Strategy:</span>
                <span>{wowAlert.newStrategy}</span>
              </div>
            </div>

            <button
              onClick={() => setWowAlert(null)}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 hover:opacity-95 transition-all"
            >
              Continue with Adapted Intuition
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
