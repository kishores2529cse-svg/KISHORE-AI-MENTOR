import re
import os
import io
import logging
import asyncio
from typing import List, Dict, Any, Optional

import edge_tts
import requests

from app.config import settings

logger = logging.getLogger("voice_service")

# Curated High-Definition Neural Voice Personas
CURATED_NEURAL_VOICES = [
    {
        "id": "en-IN-PrabhatNeural",
        "name": "Mentor (Indian English)",
        "lang": "en-IN",
        "gender": "Male",
        "recommended": True,
        "description": "Empathetic, clear, and natural pedagogical mentor voice."
    },
    {
        "id": "ta-IN-ValluvarNeural",
        "name": "Mentor (Tamil)",
        "lang": "ta-IN",
        "gender": "Male",
        "recommended": False,
        "description": "Articulate, natural Tamil mentor voice."
    },
    {
        "id": "hi-IN-MadhurNeural",
        "name": "Mentor (Hindi)",
        "lang": "hi-IN",
        "gender": "Male",
        "recommended": False,
        "description": "Clear, engaging Hindi academic voice."
    },
    {
        "id": "en-IN-NeerjaNeural",
        "name": "Priya (Indian English - Tutor)",
        "lang": "en-IN",
        "gender": "Female",
        "recommended": False,
        "description": "Warm, engaging, and articulate female academic voice."
    },
    {
        "id": "ta-IN-PallaviNeural",
        "name": "Pallavi (Tamil - Tutor)",
        "lang": "ta-IN",
        "gender": "Female",
        "recommended": False,
        "description": "Engaging Tamil tutor voice."
    },
    {
        "id": "hi-IN-SwaraNeural",
        "name": "Swara (Hindi - Tutor)",
        "lang": "hi-IN",
        "gender": "Female",
        "recommended": False,
        "description": "Warm, conversational Hindi tutor voice."
    },
    {
        "id": "en-US-ChristopherNeural",
        "name": "Christopher (US English - Deep & Warm)",
        "lang": "en-US",
        "gender": "Male",
        "recommended": False,
        "description": "Deep, authoritative, and studio-grade American voice."
    },
    {
        "id": "en-US-JennyNeural",
        "name": "Jenny (US English - Expressive)",
        "lang": "en-US",
        "gender": "Female",
        "recommended": False,
        "description": "Clear, friendly, conversational US voice."
    },
    {
        "id": "en-GB-RyanNeural",
        "name": "Ryan (British English - Academic)",
        "lang": "en-GB",
        "gender": "Male",
        "recommended": False,
        "description": "Refined, articulate British accent perfect for lectures."
    }
]

def resolve_voice_for_language(language: Optional[str], requested_voice: Optional[str] = None) -> str:
    """Selects the best matching neural voice based on language if requested_voice is default or unset."""
    if requested_voice and any(v["id"] == requested_voice for v in CURATED_NEURAL_VOICES):
        # If user explicitly requested a non-default voice that matches the language family, honor it
        return requested_voice
    
    lang_lower = (language or "english").lower().strip()
    if "tamil" in lang_lower or "ta" == lang_lower:
        return "ta-IN-ValluvarNeural"
    elif "hindi" in lang_lower or "hi" == lang_lower:
        return "hi-IN-MadhurNeural"
    elif "hinglish" in lang_lower:
        return "en-IN-PrabhatNeural"
    
    return requested_voice or "en-IN-PrabhatNeural"


def vocalize_math_and_clean_text(text: str) -> str:
    """
    Transforms markdown, LaTeX, and technical formulas into natural spoken English.
    Example: $E = mc^2$ -> "E equals m c squared"
             $\\frac{V}{R} = I$ -> "V over R equals I"
    """
    if not text:
        return ""

    spoken = text

    # 1. Remove code blocks or summarize them
    spoken = re.sub(r'```[\w]*\n(.*?)```', r' (code snippet) ', spoken, flags=re.DOTALL)
    spoken = re.sub(r'`([^`]+)`', r'\1', spoken)

    # 2. Convert common LaTeX fractions: \frac{a}{b} -> "a over b"
    spoken = re.sub(r'\\frac\{([^{}]+)\}\{([^{}]+)\}', r'\1 over \2', spoken)

    # 3. Convert square roots: \sqrt{x} -> "square root of x"
    spoken = re.sub(r'\\sqrt\{([^{}]+)\}', r'square root of \1', spoken)

    # 4. Convert superscripts/powers: x^2 -> "x squared", x^3 -> "x cubed", x^n -> "x to the power of n"
    spoken = re.sub(r'(\b[A-Za-z0-9]+)\^2\b', r'\1 squared', spoken)
    spoken = re.sub(r'(\b[A-Za-z0-9]+)\^3\b', r'\1 cubed', spoken)
    spoken = re.sub(r'(\b[A-Za-z0-9]+)\^\{?([A-Za-z0-9]+)\}?', r'\1 to the power of \2', spoken)

    # 5. Convert subscripts: v_1 -> "v 1", x_{max} -> "x max"
    spoken = re.sub(r'(\b[A-Za-z]+)_\{?([A-Za-z0-9]+)\}?', r'\1 \2', spoken)

    # 6. Common Greek Letters & Math Symbols
    greek_and_symbols = {
        r'\\Delta': 'delta',
        r'\\delta': 'delta',
        r'\\theta': 'theta',
        r'\\pi': 'pi',
        r'\\alpha': 'alpha',
        r'\\beta': 'beta',
        r'\\gamma': 'gamma',
        r'\\lambda': 'lambda',
        r'\\omega': 'omega',
        r'\\sigma': 'sigma',
        r'\\mu': 'mu',
        r'\\int': 'integral of',
        r'\\sum': 'sum of',
        r'\\infty': 'infinity',
        r'\\approx': 'is approximately',
        r'\\neq': 'is not equal to',
        r'\\leq': 'is less than or equal to',
        r'\\le': 'is less than or equal to',
        r'\\geq': 'is greater than or equal to',
        r'\\ge': 'is greater than or equal to',
        r'\\times': 'times',
        r'\\pm': 'plus or minus',
        r'\\to': 'approaches',
        r'\\rightarrow': 'leads to',
        r'\\cdot': 'dot',
        r'\\Omega': 'Ohms',
    }
    for symbol, spoken_sym in greek_and_symbols.items():
        spoken = re.sub(symbol, f' {spoken_sym} ', spoken)

    # 7. Strip remaining math delimiters $ and $$
    spoken = spoken.replace('$$', ' ').replace('$', ' ')

    # 8. Clean markdown headers and bullet markers
    spoken = re.sub(r'^#{1,6}\s+', '', spoken, flags=re.MULTILINE)
    spoken = re.sub(r'^\s*[-*+]\s+', '', spoken, flags=re.MULTILINE)
    spoken = re.sub(r'\*\*([^*]+)\*\*', r'\1', spoken)
    spoken = re.sub(r'\*([^*]+)\*', r'\1', spoken)
    spoken = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', spoken)

    # 9. Clean multi-spaces and newlines
    spoken = re.sub(r'\s+', ' ', spoken).strip()

    return spoken


class VoiceService:
    @staticmethod
    def get_voices() -> List[Dict[str, Any]]:
        return CURATED_NEURAL_VOICES

    @staticmethod
    async def synthesize_neural_speech(
        text: str,
        voice: str = "en-IN-PrabhatNeural",
        rate: str = "+0%",
        pitch: str = "+0Hz"
    ) -> bytes:
        """
        Generates high-definition neural speech using Microsoft Edge Neural TTS.
        Returns MP3 audio bytes.
        """
        spoken_text = vocalize_math_and_clean_text(text)
        if not spoken_text:
            spoken_text = "I am listening."

        # Validate voice ID
        valid_voice_ids = [v["id"] for v in CURATED_NEURAL_VOICES]
        selected_voice = voice if voice in valid_voice_ids else "en-IN-PrabhatNeural"

        communicate = edge_tts.Communicate(
            text=spoken_text,
            voice=selected_voice,
            rate=rate,
            pitch=pitch
        )

        audio_buffer = io.BytesIO()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_buffer.write(chunk["data"])

        return audio_buffer.getvalue()

    @staticmethod
    async def transcribe_audio(
        audio_bytes: bytes,
        filename: str = "audio.webm",
        content_type: str = "audio/webm"
    ) -> Dict[str, Any]:
        """
        Transcribes student voice audio using Whisper Large v3 (Groq/OpenAI/compatible).
        """
        if not audio_bytes or len(audio_bytes) < 100:
            return {"text": "", "confidence": 0.0, "error": "Empty audio payload"}

        groq_key = os.getenv("GROK_API_KEY") or os.getenv("GROQ_API_KEY") or ""
        openai_key = os.getenv("OPENAI_API_KEY") or ""

        # Check if GROQ key is available for Whisper-large-v3
        if groq_key and groq_key.startswith("gsk_"):
            try:
                headers = {"Authorization": f"Bearer {groq_key}"}
                files = {"file": (filename, audio_bytes, content_type)}
                data = {
                    "model": "whisper-large-v3",
                    "language": "en",
                    "response_format": "json"
                }
                res = requests.post(
                    "https://api.groq.com/openai/v1/audio/transcriptions",
                    headers=headers,
                    files=files,
                    data=data,
                    timeout=15
                )
                if res.status_code == 200:
                    result = res.json()
                    return {"text": result.get("text", "").strip(), "model": "whisper-large-v3"}
            except Exception as e:
                logger.warning(f"Groq Whisper transcription failed: {e}")

        # 2. Try OpenAI Whisper if standard key present
        if openai_key and openai_key.startswith("sk-"):
            try:
                headers = {"Authorization": f"Bearer {openai_key}"}
                files = {"file": (filename, audio_bytes, content_type)}
                data = {"model": "whisper-1", "language": "en"}
                res = requests.post(
                    "https://api.openai.com/v1/audio/transcriptions",
                    headers=headers,
                    files=files,
                    data=data,
                    timeout=15
                )
                if res.status_code == 200:
                    result = res.json()
                    return {"text": result.get("text", "").strip(), "model": "whisper-1"}
            except Exception as e:
                logger.warning(f"OpenAI Whisper transcription failed: {e}")

        # 3. Use Local Faster-Whisper Engine (High-Accuracy Offline Neural STT)
        try:
            import tempfile
            from faster_whisper import WhisperModel

            def _local_transcribe(data: bytes, ext: str) -> str:
                with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tf:
                    tf.write(data)
                    temp_path = tf.name
                try:
                    # Lazy load base.en model
                    if not hasattr(VoiceService, "_whisper_model") or VoiceService._whisper_model is None:
                        logger.info("Loading local Faster-Whisper (base.en) model...")
                        VoiceService._whisper_model = WhisperModel("base.en", device="cpu", compute_type="int8")
                    
                    segments, info = VoiceService._whisper_model.transcribe(
                        temp_path,
                        beam_size=3,
                        language="en",
                        vad_filter=True
                    )
                    return " ".join([seg.text for seg in segments]).strip()
                finally:
                    if os.path.exists(temp_path):
                        try:
                            os.remove(temp_path)
                        except Exception:
                            pass

            ext = os.path.splitext(filename)[1] or ".webm"
            loop = asyncio.get_running_loop()
            transcribed_text = await loop.run_in_executor(None, _local_transcribe, audio_bytes, ext)
            if transcribed_text:
                return {
                    "text": transcribed_text,
                    "model": "faster-whisper-base.en",
                    "status": "success"
                }
        except Exception as e:
            logger.warning(f"Local Faster-Whisper transcription failed: {e}")

        return {
            "text": "",
            "note": "Could not transcribe audio via Whisper.",
            "status": "fallback"
        }
