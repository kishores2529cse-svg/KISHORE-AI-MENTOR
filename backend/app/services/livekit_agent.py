"""
LiveKit Real-Time AI Avatar & Voice Worker for KISHORE S AI Mentor
Reference: https://github.com/livekit/agents

This worker demonstrates how KISHORE S AI Mentor operates as a live
WebRTC participant streaming audio, video avatar frames, and pedagogical tools.
"""

import os
import sys
import logging
from typing import Optional
try:
    from dotenv import load_dotenv  # type: ignore
    load_dotenv()
except ImportError:
    pass

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("kishore-livekit-agent")

# LiveKit & Agent Framework imports (with version-resilient fallbacks)
LIVEKIT_AVAILABLE = False
try:
    from livekit.agents import (  # type: ignore
        AutoSubscribe,
        JobContext,
        JobProcess,
        WorkerOptions,
        cli,
        llm,
    )
    
    # Resilient Voice Agent import across LiveKit Agents versions (v0.8.x -> v1.x+)
    try:
        from livekit.agents.pipeline import VoicePipelineAgent as VoiceAgent  # type: ignore
    except ImportError:
        try:
            from livekit.agents.voice_assistant import VoiceAssistant as VoiceAgent  # type: ignore
        except ImportError:
            from livekit.agents.voice import Agent as VoiceAgent  # type: ignore

    # Plugins
    from livekit.plugins import silero  # type: ignore
    try:
        from livekit.plugins import deepgram  # type: ignore
    except ImportError:
        deepgram = None

    try:
        from livekit.plugins import openai  # type: ignore
    except ImportError:
        openai = None

    try:
        from livekit.plugins import google  # type: ignore
    except ImportError:
        google = None

    try:
        from livekit.plugins import cartesia  # type: ignore
    except ImportError:
        cartesia = None

    LIVEKIT_AVAILABLE = True
except ImportError as e:
    LIVEKIT_AVAILABLE = False
    logger.info(f"LiveKit agents SDK not installed in current environment ({e}). Using WebRTC & Web-Speech fallback.")


async def entrypoint(ctx: "JobContext"):
    """
    LiveKit Agent Entrypoint:
    When a student joins a 1-on-1 video call, Kishore S AI Mentor joins
    the WebRTC room as a live interactive participant.
    """
    logger.info(f"Kishore S AI Mentor joining room: {ctx.room.name}")

    # 1. Connect to the WebRTC room with audio subscription
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # 2. Configure System Prompt with Pedagogical Mission
    # Use centralized resolver to build a subject-agnostic system prompt
    try:
        from app.context_resolver import build_system_prompt
        system_text = build_system_prompt(mode="GENERAL")
    except Exception:
        system_text = (
            "You are an empathetic AI Mentor. Follow the student's current question and any provided material. "
            "If material is present, ground your answers strictly in it. Keep responses concise and precise for live TTS."
        )

    initial_ctx = llm.ChatContext()
    initial_ctx.append(role="system", text=system_text)

    # 3. Select Configured LLM (OpenRouter / DeepSeek / Grok / Gemini / OpenAI)
    llm_instance = None
    openrouter_key = os.getenv("OPENROUTER_API_KEY", "")
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    openai_key = os.getenv("OPENAI_API_KEY", "")

    if openai and openrouter_key:
        llm_instance = openai.LLM(
            model=os.getenv("OPENROUTER_MODEL", "deepseek/deepseek-chat"),
            base_url=os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"),
            api_key=openrouter_key,
        )
    elif google and gemini_key:
        llm_instance = google.LLM(
            model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
            api_key=gemini_key,
        )
    elif openai and openai_key:
        llm_instance = openai.LLM(
            model="gpt-4o-mini",
            api_key=openai_key,
        )
    elif openai:
        # Fallback to OpenAI-compatible base
        llm_instance = openai.LLM.with_groq(model="llama-3.3-70b-versatile") if hasattr(openai.LLM, "with_groq") else None

    # 4. Select STT and TTS Engines
    stt_instance = deepgram.STT() if deepgram else (openai.STT() if openai else None)
    tts_instance = cartesia.TTS() if cartesia else (openai.TTS(voice="alloy") if openai else None)
    vad_instance = silero.VAD.load() if silero else None

    # 5. Initialize Voice Pipeline Agent
    agent = VoiceAgent(
        vad=vad_instance,
        stt=stt_instance,
        llm=llm_instance,
        tts=tts_instance,
        chat_ctx=initial_ctx,
    )

    # 6. Start the live conversational voice session
    if hasattr(agent, "start"):
        agent.start(ctx.room)
    
    # 7. Say initial greeting to welcome the student
    greeting_text = "Hi! I'm listening—ask me anything and I'll ground my response to your current question or uploaded material."
    if hasattr(agent, "say"):
        await agent.say(greeting_text, allow_interruptions=True)


if __name__ == "__main__":
    if LIVEKIT_AVAILABLE:
        cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
    else:
        print("\n" + "="*70)
        print("  KISHORE S AI MENTOR — LIVEKIT REAL-TIME WEBRTC AGENT WORKER")
        print("="*70)
        print("To run the full LiveKit WebRTC server worker with sub-300ms audio:")
        print("  pip install \"livekit-agents[google,deepgram,cartesia,silero,openai]\"")
        print("  python backend/app/services/livekit_agent.py dev")
        print("="*70 + "\n")
