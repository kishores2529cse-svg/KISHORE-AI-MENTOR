# KISHORE S AI Mentor (AdaptIQ)

[![Live Demo](https://img.shields.io/badge/Live_App-Vercel-black?style=for-the-badge&logo=vercel)](https://kishore-ai-mentor.vercel.app)
[![API Status](https://img.shields.io/badge/API-Render_Live-46E3B7?style=for-the-badge&logo=render)](https://kishore-ai-mentor-backend.onrender.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python_3.12-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React 19](https://img.shields.io/badge/React_19-TypeScript-61DAFB?style=for-the-badge&logo=react)](https://react.dev)

> **"Understand. Don't Just Memorize."**  
> An autonomous adaptive mentor that detects foundational student misconceptions and dynamically pivots teaching strategies in real time.

---

## ⚡ 30-Second Judge Demo (The "Aha!" Moment)
1. Open **[Live Web App](https://kishore-ai-mentor.vercel.app)** ➔ Click **"⚡ 1-Click Demo"** ➔ **"Enter AI Classroom"**.
2. When asked about Resistance vs Current, intentionally submit: `Current increases`.
3. **Watch the AI adapt:**
   - ⚠️ **Misconception Caught:** Inverse relationship confused.
   - 🔄 **Strategy Shifted:** Formulaic lecture ➔ Interactive hydraulic water-pipe pinch analogy.
   - 📈 **Mastery Jump:** Retest correct answer ➔ Knowledge score surges **42% ➔ 91%**.

---

## 🧠 Why AdaptIQ Wins (Beyond Chatbots)
* **Active Cognitive Modeling:** Dissects *why* mistakes happen instead of just saying "incorrect".
* **Interactive Visual Sandboxes:** Live circuit sliders, fluid resistance simulations, and rendered KaTeX math.
* **Multimodal Mentor:** Real-time speech synthesis + expressive 3D/canvas neural teacher persona.
* **Document RAG Ingestion:** Instant curriculum generation from uploaded `PDF`, `DOCX`, or `PPTX` files.
* **Multilingual:** Seamless, mid-lesson switching across **English, Tamil, and Hindi**.

---

## 🛠️ Stack in Brief
* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, OGL WebGL, Framer Motion.
* **Backend:** Python 3.12, FastAPI, Pydantic v2, PyPDF, Faster-Whisper.
* **AI:** Google Gemini 2.5/3.7 Flash & OpenRouter (LLaMA 3.3 70B) with zero-cost fallback simulation.

---

## 🚀 Local Setup

```bash
# Backend
cd backend && pip install -r requirements.txt && uvicorn app.main:app --port 8000 --reload

# Frontend
cd frontend && npm install && npm run dev
```

---
[System Architecture](docs/architecture.md) • [AI Agents](docs/ai-architecture.md) • [Demo Script](docs/demo-script.md)
