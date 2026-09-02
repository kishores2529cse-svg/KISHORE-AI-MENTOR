from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# Learning Setup & Request Schemas
class CreateLessonRequest(BaseModel):
    topic: Optional[str] = None
    document_id: Optional[str] = None
    level: str = Field(default="Beginner", description="Beginner | Intermediate | Advanced")
    language: str = Field(default="English", description="English | Hindi | Tamil | Hinglish")
    duration_minutes: int = Field(default=20, description="5 | 20 | 60 | 10080")
    teaching_style: str = Field(default="Visual", description="Simple | Visual | Practical | Socratic | Exam-focused")
    learning_objective: str = Field(default="Understand concept", description="Understand concept | Exam preparation | Interview preparation | Practical application | Revision")
    desired_depth: str = Field(default="Standard", description="Quick | Standard | Deep")

class LessonSegment(BaseModel):
    concept: str
    objective: str
    estimated_duration_minutes: int
    explanation_strategy: str
    example: str
    visual_type: str = "diagram"
    visual_data: Optional[Dict[str, Any]] = None
    question_type: str = "conceptual"
    expected_mastery: float = 0.8
    difficulty: str = "easy"

class LessonPlan(BaseModel):
    lesson_id: str
    topic: str
    level: str
    language: str
    duration_minutes: int
    teaching_style: str
    learning_objective: str
    objectives: List[str]
    prerequisites: List[str]
    concepts: List[str]
    lesson_segments: List[LessonSegment]
    visual_strategy: Dict[str, Any] = Field(default_factory=dict)
    summary: str

class StudentState(BaseModel):
    student_level: str = "Beginner"
    language: str = "English"
    current_topic: str
    current_concept_index: int = 0
    current_concept: str
    mastery: Dict[str, float] = Field(default_factory=dict)
    misconceptions: List[Dict[str, Any]] = Field(default_factory=list)
    difficulty: str = "easy"
    teaching_strategy: str = "visual"
    lesson_progress: float = 0.0
    attempts: int = 0
    last_action: str = "start"
    learning_dna: Dict[str, Any] = Field(default_factory=dict)

class Question(BaseModel):
    question_id: str
    concept: str
    question: str
    question_type: str = "conceptual"
    options: Optional[List[str]] = None
    expected_answer: str
    acceptable_variations: List[str] = Field(default_factory=list)
    difficulty: str = "easy"
    misconception_mapping: Dict[str, str] = Field(default_factory=dict)
    hints: List[str] = Field(default_factory=list)

class SubmitAnswerRequest(BaseModel):
    answer: str
    time_spent_seconds: Optional[int] = 15

class AnswerEvaluation(BaseModel):
    response_id: Optional[str] = None
    language: Optional[str] = "English"
    correct: bool
    score: float = Field(ge=0.0, le=1.0)
    confidence: float = Field(ge=0.0, le=1.0)
    reason: str
    misconception: Optional[str] = None
    misconception_root_cause: Optional[str] = None
    mastery_change: float
    new_mastery: float
    recommended_action: str
    next_strategy: str
    teacher_feedback: str

class AdaptiveAction(BaseModel):
    response_id: Optional[str] = None
    language: Optional[str] = "English"
    action: str
    strategy: str
    difficulty: str
    reason: str
    teacher_speech: str
    visual_update: Optional[Dict[str, Any]] = None
    new_question: Optional[Question] = None

class TeacherExplanation(BaseModel):
    response_id: Optional[str] = None
    language: Optional[str] = "English"
    concept: str
    teaching_style: str
    spoken_text: str
    bullet_points: List[str] = Field(default_factory=list)
    analogy: Optional[str] = None
    practical_example: Optional[str] = None
    visual_spec: Dict[str, Any] = Field(default_factory=dict)
    grounded_in_rag: bool = False
    rag_citations: List[str] = Field(default_factory=list)
    suggested_question: Optional[Question] = None

class AssessmentQuestion(BaseModel):
    id: int
    concept: str
    question: str
    options: List[str]
    correct_option_index: int
    explanation: str
    difficulty: str

class AssessmentResult(BaseModel):
    total_score: float
    total_questions: int
    correct_count: int
    strong_areas: List[str]
    weak_areas: List[str]
    resolved_misconceptions: List[str]
    unresolved_misconceptions: List[str]
    improved_concepts: List[str]
    recommended_revision: List[str]
    next_recommended_topic: str
    learning_dna_update: Dict[str, Any]

class DocumentUploadResponse(BaseModel):
    document_id: str
    filename: str
    file_type: str
    extracted_text_preview: str
    topics_found: List[str]
    chunk_count: int
    status: str

# ----------------- CHAT & INTERACTIVE VIDEO CONVERSATION SCHEMAS -----------------
class ChatMessage(BaseModel):
    id: str
    role: str  # "user" | "assistant"
    content: str
    spoken_script: Optional[str] = None
    visual_notes: Optional[Dict[str, Any]] = None
    citations: List[str] = Field(default_factory=list)
    timestamp: str

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str
    document_id: Optional[str] = None
    topic: Optional[str] = None
    history: List[ChatMessage] = Field(default_factory=list)
    language: str = "English"

class ChatResponse(BaseModel):
    response_id: Optional[str] = None
    session_id: str
    language: Optional[str] = "English"
    message: str
    spoken_script: str
    visual_notes: Dict[str, Any] = Field(default_factory=dict)
    citations: List[str] = Field(default_factory=list)
    suggested_followups: List[str] = Field(default_factory=list)
    emotion: str = "explaining"

class ConversationSession(BaseModel):
    session_id: str
    title: str
    topic: str
    document_id: Optional[str] = None
    filename: Optional[str] = None
    messages: List[ChatMessage] = Field(default_factory=list)
    created_at: str
    updated_at: str
    summary: Optional[str] = None
