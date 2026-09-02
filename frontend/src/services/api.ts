import {
  LessonPlan,
  StudentState,
  TeacherExplanation,
  AnswerEvaluation,
  AdaptiveAction,
  AssessmentQuestion,
  AssessmentResult,
  UploadResponse,
  ChatMessage,
  ConversationSession
} from '../types';

const getApiBase = () => {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    return `http://${window.location.hostname}:8000/api`;
  }
  return 'http://localhost:8000/api';
};

const API_BASE = getApiBase();

export const api = {
  async health(): Promise<{ status: string; gemini_configured: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (!res.ok) throw new Error('Health check failed');
      return await res.json();
    } catch {
      return { status: 'healthy', gemini_configured: false };
    }
  },

  async uploadMaterial(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/material/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Upload failed');
    return await res.json();
  },

  async removeMaterial(documentId: string): Promise<{ success: boolean; mode: string }> {
    try {
      const res = await fetch(`${API_BASE}/material/${documentId}`, {
        method: 'DELETE'
      });
      return await res.json();
    } catch {
      return { success: true, mode: 'GENERAL_MODE' };
    }
  },

  async listMaterials(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/materials`);
      const data = await res.json();
      return data.materials || [];
    } catch {
      return [];
    }
  },

  async sendChatMessage(params: {
    session_id?: string;
    message: string;
    document_id?: string;
    topic?: string;
    history: ChatMessage[];
    language?: string;
  }): Promise<{
    session_id: string;
    message: string;
    spoken_script: string;
    visual_notes: any;
    citations: string[];
    suggested_followups: string[];
    emotion: string;
  }> {
    const res = await fetch(`${API_BASE}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Chat message failed');
    return await res.json();
  },

  async getSessions(): Promise<ConversationSession[]> {
    try {
      const res = await fetch(`${API_BASE}/sessions`);
      if (!res.ok) throw new Error('Failed to get sessions');
      return await res.json();
    } catch {
      return [];
    }
  },

  async saveSession(session: ConversationSession): Promise<ConversationSession> {
    try {
      const res = await fetch(`${API_BASE}/sessions/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session)
      });
      if (!res.ok) throw new Error('Failed to save session');
      return await res.json();
    } catch {
      return session;
    }
  },

  async createLesson(params: {
    topic?: string;
    document_id?: string;
    level: string;
    language: string;
    duration_minutes: number;
    teaching_style: string;
    learning_objective: string;
    desired_depth: string;
  }): Promise<LessonPlan> {
    const res = await fetch(`${API_BASE}/lesson/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Failed to create lesson');
    return await res.json();
  },

  async getLesson(lessonId: string): Promise<LessonPlan> {
    const res = await fetch(`${API_BASE}/lesson/${lessonId}`);
    if (!res.ok) throw new Error('Failed to fetch lesson');
    return await res.json();
  },

  async getStudentState(lessonId: string): Promise<StudentState> {
    const res = await fetch(`${API_BASE}/lesson/${lessonId}/state`);
    if (!res.ok) throw new Error('Failed to fetch state');
    return await res.json();
  },

  async startLesson(lessonId: string): Promise<TeacherExplanation> {
    const res = await fetch(`${API_BASE}/lesson/${lessonId}/start`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to start lesson');
    return await res.json();
  },

  async submitAnswer(lessonId: string, answer: string): Promise<AnswerEvaluation> {
    const res = await fetch(`${API_BASE}/lesson/${lessonId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer })
    });
    if (!res.ok) throw new Error('Failed to evaluate answer');
    return await res.json();
  },

  async triggerAdaptation(lessonId: string, evaluation: AnswerEvaluation): Promise<AdaptiveAction> {
    const res = await fetch(`${API_BASE}/lesson/${lessonId}/adapt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evaluation)
    });
    if (!res.ok) throw new Error('Failed to adapt');
    return await res.json();
  },

  async continueNext(lessonId: string): Promise<{
    has_next: boolean;
    current_concept?: string;
    progress?: number;
    explanation?: TeacherExplanation;
  }> {
    const res = await fetch(`${API_BASE}/lesson/${lessonId}/continue`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to continue');
    return await res.json();
  },

  async triggerPedagogicalAction(lessonId: string, actionType: string): Promise<TeacherExplanation> {
    const res = await fetch(`${API_BASE}/lesson/${lessonId}/trigger-action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action_type: actionType })
    });
    if (!res.ok) throw new Error('Failed to trigger pedagogical action');
    return await res.json();
  },

  async getAssessment(lessonId: string): Promise<{ questions: AssessmentQuestion[] }> {
    const res = await fetch(`${API_BASE}/lesson/${lessonId}/assessment`);
    if (!res.ok) throw new Error('Failed to fetch assessment');
    return await res.json();
  },

  async submitAssessment(lessonId: string, answers: Record<number, number>): Promise<AssessmentResult> {
    const res = await fetch(`${API_BASE}/lesson/${lessonId}/assessment/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers })
    });
    if (!res.ok) throw new Error('Failed to submit assessment');
    return await res.json();
  },

  async getStudentProfile(): Promise<any> {
    const res = await fetch(`${API_BASE}/student/profile`);
    if (!res.ok) throw new Error('Failed to fetch student profile');
    return await res.json();
  },

  async getNeuralVoices(): Promise<Array<{ id: string; name: string; lang: string; gender: string; recommended: boolean; description: string }>> {
    try {
      const res = await fetch(`${API_BASE}/voice/voices`);
      if (!res.ok) throw new Error('Failed to fetch voices');
      const data = await res.json();
      return data.voices || [];
    } catch {
      return [];
    }
  },

  async synthesizeSpeechAudio(
    text: string,
    voice: string = 'en-IN-PrabhatNeural',
    language: string = 'English',
    response_id?: string
  ): Promise<string> {
    const res = await fetch(`${API_BASE}/voice/speak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice, language, response_id })
    });
    if (!res.ok) throw new Error('Speech synthesis failed');
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  },

  async transcribeAudio(audioBlob: Blob): Promise<{ text: string; model?: string }> {
    const formData = new FormData();
    formData.append('file', audioBlob, 'speech.webm');
    const res = await fetch(`${API_BASE}/voice/transcribe`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Transcription failed');
    return await res.json();
  }
};
