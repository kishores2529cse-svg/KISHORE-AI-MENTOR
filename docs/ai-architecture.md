# AI Architecture — KISHORE S AI Mentor

## Models & Orchestration
- **Primary Reasoning Model**: Google Gemini 3.7 Flash (`gemini-3.7-flash`)
- **Lightweight Diagnostic Model**: Google Gemini 2.5 Flash / Flash-Lite (`gemini-2.5-flash`, `gemini-2.5-flash-lite`)
- **Configurable Fallback Simulation**: Deterministic pedagogical engine that functions seamlessly with or without live API keys.

## Agent Specifications

### 1. Lesson Planner (`agents/lesson_planner.py`)
- Transforms raw topics or RAG materials into structured multi-stage curricula with explicit time allocation, pedagogical strategies, visual types, and mastery thresholds.

### 2. Teacher Agent (`agents/teacher.py`)
- Emulates a natural human educator delivering conversational spoken explanations, analogies, and structured conceptual breakdowns.

### 3. Answer Evaluator (`agents/evaluator.py`)
- Performs semantic understanding of natural language student answers, calculates mastery deltas, and extracts misconceptions.

### 4. Misconception Detector (`agents/misconception_detector.py`)
- Categorizes errors by cognitive root cause (e.g. direct vs inverse relationship confusion) rather than simply marking answers wrong.

### 5. Adaptive Engine (`agents/adaptive_engine.py`)
- Executes strategy transitions (e.g., from dry algebraic formulas to interactive hydraulic water-pipe analogies) and generates simpler re-testing questions.

### 6. Assessment Engine (`agents/assessment_engine.py`)
- Generates post-lesson diagnostic quizzes and builds comprehensive mastery reports.
