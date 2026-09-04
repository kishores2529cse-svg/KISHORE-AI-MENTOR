# KISHORE S AI Mentor (AdaptIQ)

[![Live App](https://img.shields.io/badge/Live_App-Vercel-black?style=for-the-badge&logo=vercel)](https://kishore-ai-mentor.vercel.app)
[![API Status](https://img.shields.io/badge/API-Render_Live-46E3B7?style=for-the-badge&logo=render)](https://kishore-ai-mentor-backend.onrender.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python_3.12-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React 19](https://img.shields.io/badge/React_19-TypeScript-61DAFB?style=for-the-badge&logo=react)](https://react.dev)

> **"Understand. Don't Just Memorize."**  
> An autonomous pedagogical state machine that models learner cognition, pinpoints foundational misconceptions, and dynamically pivots teaching strategies in real time.

---

## ⚡ 30-Second Evaluation Flow (The "Aha!" Moment)
1. **Launch Demo:** Open **[Live Web App](https://kishore-ai-mentor.vercel.app)** ➔ Click **"⚡ 1-Click Demo"** ➔ **"Enter AI Classroom"** *(or upload any PDF/DOCX/PPTX)*.
2. **Trigger Cognitive Pivot:** When the teacher asks the diagnostic question on Resistance vs. Current, submit:
   ```text
   Current increases
   ```
3. **Observe Autonomous Adaptation:**
   - ⚠️ **Misconception Isolated:** Identifies confusion between direct and inverse proportionality.
   - 🔄 **Pedagogy Shift:** Automatically transitions from *Algebraic Lecture* $\rightarrow$ *Interactive Hydraulic Pinch Analogy*.
   - 📈 **Mastery Verified:** Re-assess on the visual simulation $\rightarrow$ Knowledge score jumps **42% ➔ 91%**.

---

## 🧠 Architectural Differentiators (Beyond Chatbots)
* **Closed-Loop Cognitive State Machine:** Replaces passive Q&A with continuous `Diagnose ➔ Evaluate ➔ Pivot ➔ Verify` feedback loops.
* **Reactive Visual Sandboxes:** Programmatic generation of interactive circuit sliders, hydraulic flow models, and KaTeX mathematical formulas.
* **Multimodal Pedagogical Presence:** Zero-latency Web Speech TTS paired with an expressive WebGL canvas avatar mirroring mentor emotions.
* **Zero-Hallucination Document RAG:** Ingests, chunks, and semantically grounds lessons strictly on uploaded user materials (`PDF`, `DOCX`, `PPTX`).
* **Stateful Multilingual Continuity:** Seamless mid-lesson switching across **English, Tamil, and Hindi** with 100% learning-memory retention.

---

## 🛠️ Production Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS 4, OGL WebGL, Framer Motion, KaTeX |
| **Backend** | Python 3.12, FastAPI, Pydantic v2, PyPDF, python-docx, Faster-Whisper |
| **Cognitive Engine** | Dual-model orchestration (Gemini 2.5/3.7 Flash & LLaMA 3.3 70B via OpenRouter) with zero-cost fallback |

---

## 🚀 Quick Start

```bash
# Backend (FastAPI)
cd backend && pip install -r requirements.txt && uvicorn app.main:app --port 8000 --reload

# Frontend (React 19)
cd frontend && npm install && npm run dev
```

---
[Architecture Specs](docs/architecture.md) • [Agent Cognitive Pipeline](docs/ai-architecture.md) • [Evaluator Demo Script](docs/demo-script.md)