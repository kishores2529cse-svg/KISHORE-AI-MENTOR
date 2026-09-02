# LiveKit Real-Time AI Avatar & Voice Architecture

Reference: [https://github.com/livekit/agents](https://github.com/livekit/agents)

---

## 🎯 What is LiveKit Agents?
**LiveKit Agents** is a framework that allows an AI Agent to act as a **first-class WebRTC room participant**. Instead of sending HTTP request-response cycles, the AI establishes a full-duplex, sub-second WebRTC connection with the student.

---

## 🏗️ The LiveKit Pipeline for KISHORE S AI Mentor

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              WebRTC ROOM (LiveKit SFU)                                 │
│                                                                                        │
│   STUDENT (WebRTC Participant)              KISHORE S AI MENTOR (Agent Worker)        │
│   ├─ Microphone Audio Track (Opus) ────────► 1. Silero VAD (Voice Activity Detection)  │
│   │                                          2. Streaming STT (Deepgram / Whisper)     │
│   │                                          3. LLM Reasoning (Gemini 3.7 / 2.5 Flash) │
│   │                                          4. Streaming TTS (Cartesia / Piper)       │
│   │                                          5. Video Avatar Stream (Wav2Lip / Tavus)  │
│   ◄─ Spoken Audio + Lip-Synced Video ────────┴─ Published WebRTC Audio/Video Tracks    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔑 Core Features & Architectural Advantages

1. **Sub-300ms End-to-End Latency**:
   - Audio is streamed over WebRTC datagrams rather than chunked HTTP POST requests.
2. **True Interruption Handling (Barge-in)**:
   - When the student starts talking while Kishore S is speaking, Silero VAD immediately cuts off TTS audio playback and switches to listening mode.
3. **Multimodal Avatar Video Sync**:
   - The agent streams video frames synchronized with phonemes/TTS audio chunks for realistic lip movement and head gestures.
4. **Tool Calling & RAG Grounding**:
   - While in the voice call, the LLM can call external tools (e.g., retrieving chunks from an uploaded PDF, updating whiteboard KaTeX notes) asynchronously without pausing speech.

---

## 📦 How to Run with LiveKit
```bash
# 1. Install LiveKit Agents dependencies
pip install "livekit-agents[google,deepgram,cartesia,silero]"

# 2. Start Agent Worker in Dev Mode
python backend/app/services/livekit_agent.py dev
```
