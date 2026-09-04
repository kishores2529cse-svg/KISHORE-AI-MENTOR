import { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { LandingPage } from './components/landing/LandingPage';
import { NotebookDashboard } from './components/dashboard/NotebookDashboard';
import { RealTimeVoiceAgent } from './components/classroom/RealTimeVoiceAgent';
import { SetupPage } from './components/setup/SetupPage';
import { LessonPlanModal } from './components/classroom/LessonPlanModal';
import { ClassroomPage } from './components/classroom/ClassroomPage';
import { AssessmentPage } from './components/assessment/AssessmentPage';
import { ProgressPage } from './components/progress/ProgressPage';
import { LessonPlan, UploadResponse, ConversationSession } from './types';
import { api } from './services/api';
import GlowCursor from './components/ui/GlowCursor';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  
  // Active Real-Time Voice Agent Session
  const [activeTopic, setActiveTopic] = useState<string>("General Educational Mentorship");
  const [activeDocument, setActiveDocument] = useState<UploadResponse | null>(null);
  const [activeSession, setActiveSession] = useState<ConversationSession | null>(null);

  // Active Structured Lesson Plan
  const [currentPlan, setCurrentPlan] = useState<LessonPlan | null>(null);
  const [showPlanModal, setShowPlanModal] = useState<boolean>(false);

  // Check backend health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await api.health();
        setIsBackendConnected(res.status === 'healthy');
      } catch {
        setIsBackendConnected(false);
      }
    };
    checkHealth();
  }, []);

  // Launch Real-Time Voice Agent Session
  const handleStartVoiceCall = (params: {
    topic: string;
    document?: UploadResponse | null;
    existingSession?: ConversationSession | null;
  }) => {
    setActiveTopic(params.topic);
    setActiveDocument(params.document || null);
    setActiveSession(params.existingSession || null);
    setActiveTab('voice_agent');
  };

  // Launch 1-Click Voice Call
  const handleLaunchDemo = () => {
    handleStartVoiceCall({
      topic: "General Educational Mentorship"
    });
  };

  const handleLessonCreated = (plan: LessonPlan) => {
    setCurrentPlan(plan);
    setShowPlanModal(true);
  };

  const handleConfirmStartLesson = () => {
    setShowPlanModal(false);
    setActiveTab('classroom');
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white relative">
      <GlowCursor
        color="#00FF88"
        secondaryColor="#22D1EE"
        trailLength={40}
        trailWidth={8}
        glowIntensity={2.2}
        glowSpread={1.4}
        brightness={1.5}
      />
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLaunchDemo={handleLaunchDemo}
        isBackendConnected={isBackendConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage
            onStartLearning={() => setActiveTab('dashboard')}
            onUploadMaterial={() => setActiveTab('dashboard')}
            onLaunchDemo={handleLaunchDemo}
          />
        )}

        {activeTab === 'dashboard' && (
          <NotebookDashboard
            onStartSession={handleStartVoiceCall}
            onExploreLanding={() => setActiveTab('landing')}
          />
        )}

        {activeTab === 'voice_agent' && (
          <RealTimeVoiceAgent
            topic={activeTopic}
            document={activeDocument}
            existingSession={activeSession}
            onEndCall={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'setup' && (
          <SetupPage
            onLessonCreated={handleLessonCreated}
            onCancel={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'classroom' && (
          currentPlan ? (
            <ClassroomPage
              lessonPlan={currentPlan}
              onFinishLesson={() => setActiveTab('assessment')}
            />
          ) : (
            <div className="max-w-md mx-auto my-20 p-8 text-center glass-panel rounded-2xl border border-slate-800">
              <h3 className="text-base font-bold text-white mb-2">No Active Curriculum</h3>
              <p className="text-xs text-slate-400 mb-5">
                Configure a lesson in the Curriculum Studio or start a real-time voice call.
              </p>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-xs"
              >
                Go to Workspace
              </button>
            </div>
          )
        )}

        {activeTab === 'assessment' && (
          currentPlan ? (
            <AssessmentPage
              lessonPlan={currentPlan}
              onRestartLesson={() => setActiveTab('dashboard')}
              onViewProgress={() => setActiveTab('progress')}
            />
          ) : (
            <div className="text-center py-20">
              <button onClick={() => setActiveTab('dashboard')} className="text-xs text-cyan-400 underline">
                Go to Workspace
              </button>
            </div>
          )
        )}

        {activeTab === 'progress' && (
          <ProgressPage
            onStartNewLesson={(topic) => {
              if (topic) {
                handleStartVoiceCall({ topic });
              } else {
                setActiveTab('dashboard');
              }
            }}
          />
        )}
      </main>

      {/* Pre-Classroom Structured Lesson Plan Modal */}
      {showPlanModal && currentPlan && (
        <LessonPlanModal
          plan={currentPlan}
          onConfirmStart={handleConfirmStartLesson}
          onClose={() => setShowPlanModal(false)}
        />
      )}

      {/* Global Footer */}
      <footer className="glass-panel border-t border-slate-800/80 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-semibold text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            KISHORE S AI Mentor — AdaptIQ
          </span>
          <span className="italic text-slate-400">
            "Understand. Don't Just Memorize"
          </span>
          <span className="text-[11px] text-slate-500">
            Real-Time Hands-Free Voice Agent • Continuous VAD Speech
          </span>
        </div>
      </footer>

    </div>
  );
}

export default App;
