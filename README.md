# KISHORE S AI Mentor (AdaptIQ)

> **"Understand. Don't Just Memorize"**  
> *"It doesn't just answer. It understands how you learn."*

---

## 🌟 What is KISHORE S AI Mentor?
KISHORE S AI Mentor is an adaptive AI educator that builds a dynamic, evolving cognitive model of the learner's understanding and modifies its teaching strategy in real time.

It is **NOT** a generic chatbot. It explicitly implements the complete pedagogical loop:
$$\text{Understand} \rightarrow \text{Plan} \rightarrow \text{Explain} \rightarrow \text{Demonstrate} \rightarrow \text{Question} \rightarrow \text{Evaluate} \rightarrow \text{Detect Misconception} \rightarrow \text{Adapt} \rightarrow \text{Re-teach} \rightarrow \text{Assess} \rightarrow \text{Recommend}$$

---

## 🚀 Key Features

1. **Structured Lesson Planning**: Generates progressive, segmented curricula with time estimates and mastery targets before teaching begins.
2. **Document Learning (RAG)**: Ingests and chunks PDFs, DOCX, PPTX, and TXT files with zero-hallucination grounded source citations.
3. **AI Teacher Avatar & Voice**: Animated speaking presence, emotion states, speech synthesis, and real-time audio playback.
4. **Cognitive Misconception Detection**: Discovers the root cognitive cause of mistakes (e.g., confusing inverse vs direct proportionality).
5. **Subject-Aware Visual Engine**: Interactive circuits with live sliders for Voltage & Resistance, hydraulic water-pipe pinch analogies, rendered KaTeX math equations, and code snippets.
6. **Interactive Pedagogical Triggers**: Real-time control buttons: `[I DON'T UNDERSTAND]`, `[EXPLAIN DIFFERENTLY]`, `[GIVE ME AN EXAMPLE]`, `[MAKE IT SIMPLER]`, `[MAKE IT HARDER]`.
7. **Multilingual Independence**: Seamlessly learn in English, Hindi, Tamil, or Hinglish without losing lesson context or progress.
8. **Final Assessment & Learning Report**: Post-lesson diagnostic quizzes, strong vs weak concept breakdowns, and curricular next steps.
9. **Learning DNA Profile**: Long-term tracking of strategy effectiveness, visual vs theoretical affinity, and learning velocity.

---

## 🛠️ Technology Stack (Free-First & Open-Source)

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, Lucide React, Framer Motion, KaTeX, Recharts, Canvas-Confetti.
- **Backend**: Python 3.12, FastAPI, Uvicorn, Pydantic v2, python-dotenv, PyPDF, python-docx, python-pptx.
- **AI Models**: Google Gemini 3.7 Flash & Gemini 2.5 Flash / Flash-Lite (with built-in deterministic pedagogical simulation).
- **Speech**: Web Speech API & Whisper/Piper integration points.

---

## ⚡ Quick Start Guide

### 1. Backend Setup
```bash
cd backend
py -m pip install -r requirements.txt
py -m uvicorn app.main:app --port 8000 --reload
```
API Documentation: `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Application: `http://localhost:5173`

---

## 🎯 The Signature "WOW Moment" Demo
To experience the core differentiator of KISHORE S AI Mentor:
1. Open `http://localhost:5173` and click **"⚡ 1-Click Demo"**.
2. Click **"Enter AI Classroom"**.
3. When the teacher asks the diagnostic question on Resistance vs Current, submit:
   ```
   Current increases
   ```
4. **Observe**:
   - `⚠ MISCONCEPTION DETECTED` (Inverse relationship confused)
   - `TEACHING STRATEGY CHANGED` (Algebraic formula → Water-pipe Analogy)
   - Teacher re-explains with the water-pipe squeeze visual.
   - Retest question: submit `Current increases` after pipe is loosened.
   - **Mastery jumps from 42% to 91%!**

---

## 📚 Documentation Links
- [System Architecture](docs/architecture.md)
- [AI Architecture & Agents](docs/ai-architecture.md)
- [Hackathon Demo Presentation Script](docs/demo-script.md)
