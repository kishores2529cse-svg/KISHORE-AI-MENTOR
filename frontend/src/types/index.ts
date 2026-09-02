export interface LessonSegment {
  concept: string;
  objective: string;
  estimated_duration_minutes: number;
  explanation_strategy: string;
  example: string;
  visual_type: string;
  visual_data?: Record<string, any>;
  question_type: string;
  expected_mastery: number;
  difficulty: string;
}

export interface LessonPlan {
  lesson_id: string;
  topic: string;
  level: string;
  language: string;
  duration_minutes: number;
  teaching_style: string;
  learning_objective: string;
  objectives: string[];
  prerequisites: string[];
  concepts: string[];
  lesson_segments: LessonSegment[];
  visual_strategy: Record<string, any>;
  summary: string;
}

export interface StudentState {
  student_level: string;
  language: string;
  current_topic: string;
  current_concept_index: number;
  current_concept: string;
  mastery: Record<string, number>;
  misconceptions: Array<{
    concept: string;
    misconception: string;
    root_cause?: string;
    student_answer?: string;
  }>;
  difficulty: string;
  teaching_strategy: string;
  lesson_progress: number;
  attempts: number;
  last_action: string;
}

export interface Question {
  question_id: string;
  concept: string;
  question: string;
  question_type: string;
  options?: string[];
  expected_answer: string;
  acceptable_variations?: string[];
  difficulty: string;
  misconception_mapping?: Record<string, string>;
  hints?: string[];
}

export interface AnswerEvaluation {
  response_id?: string;
  language?: string;
  correct: boolean;
  score: number;
  confidence: number;
  reason: string;
  misconception?: string | null;
  misconception_root_cause?: string | null;
  mastery_change: number;
  new_mastery: number;
  recommended_action: string;
  next_strategy: string;
  teacher_feedback: string;
}

export interface AdaptiveAction {
  response_id?: string;
  language?: string;
  action: string;
  strategy: string;
  difficulty: string;
  reason: string;
  teacher_speech: string;
  visual_update?: Record<string, any>;
  new_question?: Question;
}

export interface TeacherExplanation {
  response_id?: string;
  language?: string;
  concept: string;
  teaching_style: string;
  spoken_text: string;
  bullet_points: string[];
  analogy?: string;
  practical_example?: string;
  visual_spec: Record<string, any>;
  grounded_in_rag: boolean;
  rag_citations?: string[];
  suggested_question?: Question;
}

export interface AssessmentQuestion {
  id: number;
  concept: string;
  question: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
  difficulty: string;
}

export interface AssessmentResult {
  total_score: number;
  total_questions: number;
  correct_count: number;
  strong_areas: string[];
  weak_areas: string[];
  resolved_misconceptions: string[];
  unresolved_misconceptions: string[];
  improved_concepts: string[];
  recommended_revision: string[];
  next_recommended_topic: string;
  learning_dna_update: Record<string, any>;
}

export interface UploadResponse {
  document_id: string;
  filename: string;
  file_type: string;
  extracted_text_preview: string;
  topics_found: string[];
  chunk_count: number;
  status: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  spoken_script?: string;
  visual_notes?: {
    title?: string;
    formula_latex?: string;
    bullet_points?: string[];
    analogy?: string;
  };
  citations?: string[];
  timestamp: string;
}

export interface ConversationSession {
  session_id: string;
  title: string;
  topic: string;
  document_id?: string;
  filename?: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
  summary?: string;
}
