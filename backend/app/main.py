import os
import sys
import uuid
import json

# Ensure backend root is in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from typing import Dict, Any, Optional, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Response  # type: ignore
from fastapi.middleware.cors import CORSMiddleware  # type: ignore
from pydantic import BaseModel  # type: ignore

from app.services.voice_service import VoiceService
from app.config import settings
from app.models.schemas import (
    CreateLessonRequest,
    LessonPlan,
    StudentState,
    TeacherExplanation,
    Question,
    SubmitAnswerRequest,
    AnswerEvaluation,
    AdaptiveAction,
    AssessmentResult,
    DocumentUploadResponse,
    ChatMessage,
    ChatRequest,
    ChatResponse,
    ConversationSession
)
from app.agents.lesson_planner import LessonPlanner
from app.agents.teacher import TeacherAgent
from app.agents.evaluator import EvaluatorAgent
from app.agents.misconception_detector import MisconceptionDetector
from app.agents.adaptive_engine import AdaptiveEngine
from app.agents.visual_planner import VisualPlanner
from app.agents.assessment_engine import AssessmentEngine
from app.agents.learning_path import LearningPathEngine
from app.rag.service import RAGService
from app.services.llm_service import LLMService

app = FastAPI(
    title="KISHORE S AI Mentor — AdaptIQ API",
    description="Adaptive AI Teacher API that understands how you learn with live interactive human video mentor.",
    version="1.0.0"
)

# Enable CORS for all ports and LAN hosts
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active Session & Conversation Storage
_ACTIVE_LESSONS: Dict[str, LessonPlan] = {}
_ACTIVE_STATES: Dict[str, StudentState] = {}
_ACTIVE_EXPLANATIONS: Dict[str, TeacherExplanation] = {}
_ACTIVE_CURRENT_QUESTIONS: Dict[str, Question] = {}
_CONVERSATION_SESSIONS: Dict[str, ConversationSession] = {}

@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "status": "operational",
        "ai_active": LLMService.is_ai_active(),
        "provider": LLMService.get_active_provider(),
        "model": settings.OPENROUTER_MODEL if settings.OPENROUTER_API_KEY else settings.GEMINI_MODEL
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "gemini_configured": LLMService.is_ai_active(),
        "ai_active": LLMService.is_ai_active(),
        "provider": LLMService.get_active_provider(),
        "speech_engine": settings.SPEECH_ENGINE
    }

# ----------------- DOCUMENT / RAG INGESTION & MANAGEMENT -----------------
@app.post("/api/material/upload", response_model=DocumentUploadResponse)
async def upload_material(file: UploadFile = File(...)):
    filename = file.filename or "uploaded_document"
    save_path = os.path.join(settings.UPLOAD_DIR, f"{uuid.uuid4().hex[:6]}_{filename}")
    
    with open(save_path, "wb") as f:
        content = await file.read()
        f.write(content)
        
    doc_record = RAGService.process_and_index_file(save_path, filename)
    
    return DocumentUploadResponse(
        document_id=doc_record["document_id"],
        filename=filename,
        file_type=os.path.splitext(filename)[1].upper().replace(".", ""),
        extracted_text_preview=doc_record["raw_text"][:350] + "...",
        topics_found=doc_record["topics_found"],
        chunk_count=doc_record["chunk_count"],
        status="Indexed & RAG-Ready"
    )

@app.get("/api/materials")
def list_materials():
    """List all indexed study materials in memory"""
    return {"materials": RAGService.list_documents()}

@app.delete("/api/material/{document_id}")
def delete_material(document_id: str):
    """Purge document from RAG index, switching active session back to General Mode"""
    removed = RAGService.remove_document(document_id)
    return {"success": removed, "document_id": document_id, "mode": "GENERAL_MODE"}

# ----------------- DUAL-MODE INTERACTIVE CHAT & VIDEO TUTOR -----------------
@app.post("/api/chat/message", response_model=ChatResponse)
def handle_chat_message(req: ChatRequest):
    session_id = req.session_id or f"sess_{uuid.uuid4().hex[:8]}"
    
    # 1. Determine Mode: MODE A (Document Grounded) vs MODE B (General Voice Chat)
    rag_context = ""
    citations: List[str] = []
    is_document_mode = False
    found_in_doc = False
    doc_name = ""
    
    if req.document_id:
        doc = RAGService.get_document(req.document_id)
        if doc:
            is_document_mode = True
            doc_name = doc["filename"]
            rag_context, citations, found_in_doc = RAGService.retrieve_grounding(req.document_id, req.message)
    
    # 2. Build Mode-Aware System and Context Prompts
    if is_document_mode:
        if found_in_doc:
            prompt = f"""
You are KISHORE S, an empathetic, brilliant personal AI Mentor and Teacher.
Mode: DOCUMENT_MODE (Grounded answering based strictly on the uploaded learning material).
Tagline: "Understand. Don't Just Memorize".

Current Active Document: {doc_name}
Relevant Document Excerpts:
{rag_context}

Student Question: "{req.message}"
Language: {req.language}

Pedagogical Rules:
1. Explain the answer accurately using the factual evidence in the uploaded document excerpts.
2. Deliver a warm, articulate, conversational spoken response (2-3 sentences) suitable for live AI voice avatar.
3. Provide visual notes matching this specific document topic.
4. Include citations: {json.dumps(citations)}

Output pure JSON:
{{
  "message": "Full detailed markdown explanation grounded in document...",
  "spoken_script": "Conversational spoken voice script...",
  "visual_notes": {{
    "title": "{doc_name} — Key Insight",
    "formula_latex": null,
    "bullet_points": ["Point 1", "Point 2"],
    "analogy": "Memorable intuition or analogy..."
  }},
  "citations": {json.dumps(citations)},
  "suggested_followups": ["Follow-up question 1", "Follow-up question 2"],
  "emotion": "explaining"
}}
"""
        else:
            prompt = f"""
You are KISHORE S, an empathetic personal AI Mentor.
Mode: DOCUMENT_MODE (The student uploaded '{doc_name}', but their question is not covered in the document).

Uploaded Document: {doc_name}
Student Question: "{req.message}"
Language: {req.language}

Pedagogical Rules:
1. State politely that this specific detail was not found in '{doc_name}', and then explain it clearly using general foundational knowledge.
2. Keep the `spoken_script` friendly and conversational (2-3 sentences).
3. Provide visual notes for the concept.

Output pure JSON:
{{
  "message": "I couldn't find that specific detail in your uploaded document **{doc_name}**. However, based on general principles...",
  "spoken_script": "I didn't find that in {doc_name}, but here is how it works from first principles.",
  "visual_notes": {{
    "title": "General Conceptual Explanation",
    "formula_latex": null,
    "bullet_points": ["Point 1", "Point 2"],
    "analogy": "Intuitive analogy..."
  }},
  "citations": ["General Educational Knowledge"],
  "suggested_followups": ["Question 1", "Question 2"],
  "emotion": "explaining"
}}
"""
    else:
        # MODE B — GENERAL VOICE CHAT MODE (No document attached)
        prompt = f"""
You are KISHORE S, an empathetic, brilliant personal AI Mentor and Teacher.
Mode: GENERAL_VOICE_CHAT_MODE (General educational mentorship without predefined subject or document).
Tagline: "Understand. Don't Just Memorize".

Context:
- Current Topic / Query: {req.topic or req.message}
- Language: {req.language}

Student Said / Asked: "{req.message}"

Pedagogical Rules:
1. If the student makes a greeting or general conversational remark (e.g. "hi", "how are you", "cool"), respond warmly and invite their curiosity.
2. If the student asks an educational question (in Computer Science, DBMS, Mathematics, Physics, Programming, History, etc.), elucidate it intuitively with memorable analogies or first-principles reasoning.
3. DO NOT assume or mention Ohm's Law, voltage, resistance, or circuits unless the student explicitly asks about electricity.
4. Keep `spoken_script` conversational, engaging, and articulate (2-3 sentences) for live text-to-speech avatar voice.
5. Provide `visual_notes` tailored specifically to this concept.

Output pure JSON:
{{
  "message": "Full detailed markdown explanation...",
  "spoken_script": "Conversational spoken voice script...",
  "visual_notes": {{
    "title": "{req.topic or 'Key Intuition'}",
    "formula_latex": null,
    "bullet_points": ["Point 1", "Point 2"],
    "analogy": "Intuitive analogy..."
  }},
  "citations": ["Kishore S Knowledge Base"],
  "suggested_followups": ["Question 1", "Question 2"],
  "emotion": "explaining"
}}
"""

    print("\n" + "=" * 60, flush=True)
    print("=== KISHORE S AI MENTOR MODEL REQUEST ===", flush=True)
    print(f"session_id: {session_id}", flush=True)
    print(f"mode: {'MATERIAL_MODE' if is_document_mode else 'GENERAL_MODE'}", flush=True)
    print(f"material_id: {req.document_id}", flush=True)
    print(f"current_topic: {req.topic}", flush=True)
    print(f"student_question: {req.message}", flush=True)
    print(f"retrieved_context: {rag_context[:100] if rag_context else 'NONE'}", flush=True)
    print("=" * 60 + "\n", flush=True)

    system_instruction = "You are Kishore S, an empathetic, intuitive AI Mentor. Output pure JSON."
    data = LLMService.generate_structured_json(prompt, system_instruction)
    
    if not data.get("message"):
        msg = f"Glad we are discussing this! Regarding \"{req.message}\", what specific aspect would you like to explore deeper together?"
        spoken = f"I'm with you! What part of {req.topic or 'this topic'} should we dive into next?"
        data = {
            "message": msg,
            "spoken_script": spoken,
            "visual_notes": {
                "title": req.topic or "Interactive Mentorship",
                "formula_latex": None,
                "bullet_points": [
                    "Ask any question or share a thought",
                    "We break down ideas step-by-step"
                ],
                "analogy": "Learning is like connecting puzzle pieces—one clear intuition at a time."
            },
            "citations": citations or ["Kishore S Knowledge Base"],
            "suggested_followups": [
                "Can you explain the core mechanism?",
                "How does this apply in real life?"
            ],
            "emotion": "encouraging"
        }
        
    response_id = f"resp_{uuid.uuid4().hex[:10]}"
    return ChatResponse(
        response_id=response_id,
        session_id=session_id,
        language=req.language,
        message=data.get("message", "Let's explore this together!"),
        spoken_script=data.get("spoken_script", "I'm ready to elucidate this concept with you."),
        visual_notes=data.get("visual_notes", {}),
        citations=data.get("citations", citations),
        suggested_followups=data.get("suggested_followups", []),
        emotion=data.get("emotion", "explaining")
    )

# ----------------- SESSION STORAGE & RETRIEVAL -----------------
@app.get("/api/sessions", response_model=List[ConversationSession])
def get_sessions():
    return list(_CONVERSATION_SESSIONS.values())

@app.get("/api/sessions/{session_id}", response_model=ConversationSession)
def get_session(session_id: str):
    if session_id not in _CONVERSATION_SESSIONS:
        raise HTTPException(status_code=404, detail="Session not found")
    return _CONVERSATION_SESSIONS[session_id]

@app.post("/api/sessions/save", response_model=ConversationSession)
def save_session(session: ConversationSession):
    _CONVERSATION_SESSIONS[session.session_id] = session
    return session

@app.delete("/api/sessions/{session_id}")
def delete_session(session_id: str):
    if session_id in _CONVERSATION_SESSIONS:
        del _CONVERSATION_SESSIONS[session_id]
    return {"success": True, "session_id": session_id}

# ----------------- LESSON CREATION & LIFECYCLE -----------------
@app.post("/api/lesson/create", response_model=LessonPlan)
def create_lesson(req: CreateLessonRequest):
    rag_context = None
    if req.document_id:
        rag_context, _, _ = RAGService.retrieve_grounding(req.document_id, req.topic or "Overview")
        
    plan = LessonPlanner.create_plan(req, rag_context=rag_context)
    plan.document_id = req.document_id
    _ACTIVE_LESSONS[plan.lesson_id] = plan
    
    init_mastery = {concept: 0.35 for concept in plan.concepts}
    _ACTIVE_STATES[plan.lesson_id] = StudentState(
        student_level=req.level,
        language=req.language,
        current_topic=plan.topic,
        current_concept_index=0,
        current_concept=plan.concepts[0] if plan.concepts else plan.topic,
        mastery=init_mastery,
        teaching_strategy=req.teaching_style.lower(),
        lesson_progress=10.0
    )
    
    return plan

@app.get("/api/lesson/{lesson_id}", response_model=LessonPlan)
def get_lesson(lesson_id: str):
    if lesson_id not in _ACTIVE_LESSONS:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return _ACTIVE_LESSONS[lesson_id]

@app.get("/api/lesson/{lesson_id}/state", response_model=StudentState)
def get_lesson_state(lesson_id: str):
    if lesson_id not in _ACTIVE_STATES:
        raise HTTPException(status_code=404, detail="Student state not found")
    return _ACTIVE_STATES[lesson_id]

@app.post("/api/lesson/{lesson_id}/start", response_model=TeacherExplanation)
def start_lesson(lesson_id: str):
    if lesson_id not in _ACTIVE_LESSONS:
        raise HTTPException(status_code=404, detail="Lesson not found")
        
    plan = _ACTIVE_LESSONS[lesson_id]
    state = _ACTIVE_STATES[lesson_id]
    
    rag_context = None
    if getattr(plan, "document_id", None):
        rag_context, _, _ = RAGService.retrieve_grounding(plan.document_id, state.current_concept)
        
    concept = plan.concepts[state.current_concept_index] if plan.concepts else plan.topic
    explanation = TeacherAgent.explain_concept(
        concept=concept,
        topic=plan.topic,
        student_level=state.student_level,
        teaching_style=plan.teaching_style,
        language=state.language,
        rag_context=rag_context
    )
    explanation.response_id = f"resp_{uuid.uuid4().hex[:10]}"
    explanation.language = state.language
    
    _ACTIVE_EXPLANATIONS[lesson_id] = explanation
    if explanation.suggested_question:
        _ACTIVE_CURRENT_QUESTIONS[lesson_id] = explanation.suggested_question
        
    return explanation

@app.post("/api/lesson/{lesson_id}/answer", response_model=AnswerEvaluation)
def submit_answer(lesson_id: str, req: SubmitAnswerRequest):
    if lesson_id not in _ACTIVE_LESSONS or lesson_id not in _ACTIVE_STATES:
        raise HTTPException(status_code=404, detail="Lesson session not found")
        
    plan = _ACTIVE_LESSONS[lesson_id]
    state = _ACTIVE_STATES[lesson_id]
    question = _ACTIVE_CURRENT_QUESTIONS.get(lesson_id)
    
    if not question:
        question = Question(
            question_id="q_fallback",
            concept=state.current_concept,
            question=f"What is the core intuitive mechanism in {state.current_concept}?",
            expected_answer=f"Fundamental understanding of {state.current_concept}",
            acceptable_variations=[],
            difficulty="easy"
        )
        
    evaluation = EvaluatorAgent.evaluate_answer(
        question=question,
        student_answer=req.answer,
        state=state,
        teaching_style=plan.teaching_style
    )
    evaluation.response_id = f"resp_{uuid.uuid4().hex[:10]}"
    evaluation.language = state.language
    
    state.mastery[state.current_concept] = evaluation.new_mastery
    state.attempts += 1
    state.last_action = "answer_evaluated"
    
    if evaluation.misconception:
        state.misconceptions.append({
            "concept": state.current_concept,
            "misconception": evaluation.misconception,
            "root_cause": evaluation.misconception_root_cause,
            "student_answer": req.answer
        })
        
    return evaluation

@app.post("/api/lesson/{lesson_id}/adapt", response_model=AdaptiveAction)
def trigger_adaptation(lesson_id: str, evaluation: AnswerEvaluation):
    if lesson_id not in _ACTIVE_LESSONS or lesson_id not in _ACTIVE_STATES:
        raise HTTPException(status_code=404, detail="Lesson session not found")
        
    plan = _ACTIVE_LESSONS[lesson_id]
    state = _ACTIVE_STATES[lesson_id]
    
    action = AdaptiveEngine.decide_adaptation(
        evaluation=evaluation,
        state=state,
        current_concept=state.current_concept,
        teaching_style=plan.teaching_style
    )
    action.response_id = f"resp_{uuid.uuid4().hex[:10]}"
    action.language = state.language
    
    state.teaching_strategy = action.strategy
    if action.new_question:
        _ACTIVE_CURRENT_QUESTIONS[lesson_id] = action.new_question
        
    return action

class TriggerActionRequest(BaseModel):
    action_type: str

@app.post("/api/lesson/{lesson_id}/trigger-action", response_model=TeacherExplanation)
def trigger_pedagogical_action(lesson_id: str, req: TriggerActionRequest):
    if lesson_id not in _ACTIVE_LESSONS or lesson_id not in _ACTIVE_STATES:
        raise HTTPException(status_code=404, detail="Lesson session not found")
        
    plan = _ACTIVE_LESSONS[lesson_id]
    state = _ACTIVE_STATES[lesson_id]
    
    rag_context = None
    if getattr(plan, "document_id", None):
        rag_context, _, _ = RAGService.retrieve_grounding(plan.document_id, state.current_concept)
        
    explanation = TeacherAgent.explain_concept(
        concept=state.current_concept,
        topic=plan.topic,
        student_level=state.student_level,
        teaching_style=plan.teaching_style,
        language=state.language,
        rag_context=rag_context,
        strategy_override=req.action_type
    )
    explanation.response_id = f"resp_{uuid.uuid4().hex[:10]}"
    explanation.language = state.language
    
    _ACTIVE_EXPLANATIONS[lesson_id] = explanation
    if explanation.suggested_question:
        _ACTIVE_CURRENT_QUESTIONS[lesson_id] = explanation.suggested_question
        
    return explanation

@app.post("/api/lesson/{lesson_id}/continue")
def continue_next_concept(lesson_id: str):
    if lesson_id not in _ACTIVE_LESSONS or lesson_id not in _ACTIVE_STATES:
        raise HTTPException(status_code=404, detail="Lesson session not found")
        
    plan = _ACTIVE_LESSONS[lesson_id]
    state = _ACTIVE_STATES[lesson_id]
    
    next_idx = state.current_concept_index + 1
    if next_idx < len(plan.concepts):
        state.current_concept_index = next_idx
        state.current_concept = plan.concepts[next_idx]
        state.lesson_progress = round(((next_idx + 1) / len(plan.concepts)) * 100, 1)
        state.last_action = "advanced_concept"
        
        rag_context = None
        if getattr(plan, "document_id", None):
            rag_context, _, _ = RAGService.retrieve_grounding(plan.document_id, state.current_concept)
            
        explanation = TeacherAgent.explain_concept(
            concept=state.current_concept,
            topic=plan.topic,
            student_level=state.student_level,
            teaching_style=plan.teaching_style,
            language=state.language,
            rag_context=rag_context
        )
        explanation.response_id = f"resp_{uuid.uuid4().hex[:10]}"
        explanation.language = state.language
        
        _ACTIVE_EXPLANATIONS[lesson_id] = explanation
        if explanation.suggested_question:
            _ACTIVE_CURRENT_QUESTIONS[lesson_id] = explanation.suggested_question
            
        return {
            "has_next": True,
            "current_concept": state.current_concept,
            "progress": state.lesson_progress,
            "explanation": explanation
        }
    else:
        state.lesson_progress = 100.0
        state.last_action = "lesson_completed"
        return {
            "has_next": False,
            "progress": 100.0,
            "message": f"Congratulations! You have completed the structured lesson on {plan.topic}."
        }

# ----------------- DIAGNOSTIC ASSESSMENT -----------------
@app.get("/api/assessment/{lesson_id}")
def get_lesson_assessment(lesson_id: str):
    if lesson_id not in _ACTIVE_LESSONS or lesson_id not in _ACTIVE_STATES:
        raise HTTPException(status_code=404, detail="Lesson session not found")
        
    plan = _ACTIVE_LESSONS[lesson_id]
    state = _ACTIVE_STATES[lesson_id]
    
    questions = AssessmentEngine.generate_assessment_questions(plan, state)
    return {"lesson_id": lesson_id, "questions": questions}

@app.post("/api/assessment/{lesson_id}/submit", response_model=AssessmentResult)
def submit_lesson_assessment(lesson_id: str, answers: Dict[int, int]):
    if lesson_id not in _ACTIVE_LESSONS or lesson_id not in _ACTIVE_STATES:
        raise HTTPException(status_code=404, detail="Lesson session not found")
        
    plan = _ACTIVE_LESSONS[lesson_id]
    state = _ACTIVE_STATES[lesson_id]
    
    questions = AssessmentEngine.generate_assessment_questions(plan, state)
    result = AssessmentEngine.evaluate_assessment(questions, answers, state, plan)
    return result

# ----------------- STUDENT LEARNING DNA & PROGRESS -----------------
@app.get("/api/student/profile")
def get_student_profile():
    return LearningPathEngine.get_default_profile()

@app.get("/api/student/curriculum")
def get_curriculum(topic: str = "Computer Science & Engineering"):
    return {"curriculum": LearningPathEngine.generate_curriculum(topic)}

# ----------------- HIGH-QUALITY NEURAL VOICE & STT ENDPOINTS -----------------
class VoiceSpeakRequest(BaseModel):
    text: str
    voice: Optional[str] = None
    language: Optional[str] = "English"
    response_id: Optional[str] = None
    rate: Optional[str] = "+0%"
    pitch: Optional[str] = "+0Hz"

@app.get("/api/voice/voices")
def list_voices():
    """Return available curated high-definition neural voices."""
    return {"voices": VoiceService.get_voices()}

@app.post("/api/voice/speak")
async def synthesize_voice(req: VoiceSpeakRequest):
    """
    Synthesizes neural human speech with mathematical LaTeX vocalization.
    Returns studio-grade MP3 audio bytes.
    """
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    try:
        from app.services.voice_service import resolve_voice_for_language
        selected_voice = resolve_voice_for_language(req.language, req.voice)
        audio_bytes = await VoiceService.synthesize_neural_speech(
            text=req.text,
            voice=selected_voice,
            rate=req.rate or "+0%",
            pitch=req.pitch or "+0Hz"
        )
        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={"Cache-Control": "public, max-age=3600"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Speech synthesis error: {str(e)}")

@app.post("/api/voice/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    language: Optional[str] = Form(None)
):
    """
    Transcribes student audio speech into clean text using Faster-Whisper.
    """
    audio_bytes = await file.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio file")
        
    try:
        transcript = await VoiceService.transcribe_audio_bytes(audio_bytes, language=language)
        return {"text": transcript, "model": "faster-whisper-base"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription error: {str(e)}")

if __name__ == "__main__":
    import uvicorn  # type: ignore
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
