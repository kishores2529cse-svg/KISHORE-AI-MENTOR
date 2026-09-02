# System Architecture — KISHORE S AI Mentor (AdaptIQ)

## Overview
KISHORE S AI Mentor is built on a modular **Multi-Agent Pedagogical Loop** architecture rather than a traditional question-answering chatbot.

```
STUDENT
   │ (Text / Speech / Document Upload)
   ▼
REACT FRONTEND (Vite + TypeScript + Tailwind CSS)
   │
   ▼ REST API
FASTAPI BACKEND (Python 3.12)
   │
   ├─► Lesson Planner Agent (Structured JSON Curriculum Generation)
   ├─► RAG / Document Engine (PDF/DOCX/PPTX Chunking & Citation Grounding)
   ├─► Teacher Agent (Spoken Pedagogy, Intuition & Socratic Framing)
   ├─► Question Generator (Diagnostic Mastery Verification)
   ├─► Answer Evaluator (Semantic Assessment & Mastery Calibration)
   ├─► Misconception Detector (Cognitive Origin Diagnosis)
   ├─► Adaptive Engine (Strategy Pivot & Scaffolding)
   ├─► Visual Planner (Subject-Aware Interactive Circuit & KaTeX Simulation)
   ├─► Assessment Engine (Final Diagnostic Quiz & Learning Report)
   └─► Learning Path Engine (Learning DNA & Future Curriculum Pathing)
```

## Non-Negotiable Pedagogical Loop
1. **UNDERSTAND**: Analyze learner level (Beginner/Intermediate/Advanced), target duration, and preferred style.
2. **PLAN**: Generate structured progressive segments with mastery goals.
3. **EXPLAIN**: Deliver vocal intuition and real-world analogies.
4. **DEMONSTRATE**: Subject-aware interactive visualizers (circuits, water-pipe pinch, KaTeX).
5. **QUESTION**: Pose conceptual check questions.
6. **EVALUATE**: Perform semantic scoring.
7. **DETECT MISCONCEPTION**: Pinpoint mental model flaws.
8. **ADAPT & RE-TEACH**: Shift teaching strategy in real time.
9. **CONFIRM UNDERSTANDING**: Re-test with tailored questions.
10. **ASSESS & REPORT**: Produce diagnostic scorecard and next learning steps.
