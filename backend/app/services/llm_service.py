import json
import logging
import re
import requests
from typing import Any, Dict, Optional
from app.config import settings

logger = logging.getLogger(__name__)

# Persistent connection pool for ultra-low latency (<1s response time)
_http_session = requests.Session()
_http_session.mount("https://", requests.adapters.HTTPAdapter(pool_connections=10, pool_maxsize=20, max_retries=1))

# Initialize Gemini if key is provided
_gemini_client = None
if settings.GEMINI_API_KEY:
    try:
        import google.generativeai as genai  # type: ignore
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _gemini_client = genai
        logger.info("Gemini AI successfully initialized.")
    except Exception as e:
        logger.warning(f"Failed to initialize Gemini SDK: {e}")

# High-speed reliable OpenRouter models with instant failover
OPENROUTER_MODEL_CASCADE = [
    "meta-llama/llama-3.3-70b-instruct",
    "qwen/qwen-2.5-72b-instruct",
    "qwen/qwen-2.5-7b-instruct",
    "deepseek/deepseek-chat",
    "mistralai/mistral-small-24b-instruct-2501"
]

class LLMService:
    @staticmethod
    def get_active_provider() -> str:
        """Determines active provider based on configured API keys"""
        if settings.OPENROUTER_API_KEY:
            return "openrouter"
        elif settings.GROK_API_KEY:
            return "grok"
        elif settings.OMNIROUTE_API_KEY:
            return "omniroute"
        elif settings.GEMINI_API_KEY and _gemini_client:
            return "gemini"
        return "fallback"

    @staticmethod
    def is_ai_active() -> bool:
        return LLMService.get_active_provider() != "fallback"

    @staticmethod
    def generate_text(prompt: str, system_instruction: Optional[str] = None, model_name: Optional[str] = None, meta: Optional[dict] = None) -> str:
        provider = LLMService.get_active_provider()
        # If no explicit system instruction provided, use centralized context resolver's default
        if not system_instruction:
            try:
                from app.context_resolver import build_system_prompt
                system_instruction = build_system_prompt(mode="GENERAL")
            except Exception:
                system_instruction = None
        
        # DEBUG LOGGING: record the call inputs (developer-only)
        try:
            import logging as _lg
            _lg.getLogger(__name__).info(f"LLM.generate_text called. system_instruction={'present' if system_instruction else 'none'}. prompt_preview={prompt[:200].replace('\n',' ')} meta={meta}")
        except Exception:
            pass
        # 1. OpenRouter with resilient multi-model cascade
        if provider == "openrouter":
            models_to_try = [model_name or settings.OPENROUTER_MODEL]
            for m in OPENROUTER_MODEL_CASCADE:
                if m not in models_to_try:
                    models_to_try.append(m)

            headers = {
                "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:5173",
                "X-Title": "Kishore S AI Mentor"
            }

            messages = []
            if system_instruction:
                messages.append({"role": "system", "content": system_instruction})
            messages.append({"role": "user", "content": prompt})

            for candidate_model in models_to_try:
                try:
                    payload = {
                        "model": candidate_model,
                        "provider": {
                            "order": ["Groq", "Cerebras", "Together", "DeepInfra", "Lepton"],
                            "allow_fallbacks": True
                        },
                        "messages": messages,
                        "temperature": 0.2,
                        "max_tokens": 450
                    }
                    res = _http_session.post(
                        f"{settings.OPENROUTER_BASE_URL}/chat/completions",
                        headers=headers,
                        json=payload,
                        timeout=12
                    )
                    if res.status_code == 200:
                        data = res.json()
                        if "choices" in data and len(data["choices"]) > 0:
                            content = data["choices"][0]["message"]["content"]
                            if content and content.strip():
                                return content.strip()
                    else:
                        logger.warning(f"OpenRouter model {candidate_model} returned {res.status_code}, trying cascade fallback...")
                except Exception as e:
                    logger.warning(f"OpenRouter attempt with {candidate_model} failed ({e}), trying next model...")

        # 2. Grok / xAI Direct
        elif provider == "grok":
            try:
                model = model_name or settings.GROK_MODEL
                headers = {
                    "Authorization": f"Bearer {settings.GROK_API_KEY}",
                    "Content-Type": "application/json"
                }
                messages = []
                if system_instruction:
                    messages.append({"role": "system", "content": system_instruction})
                messages.append({"role": "user", "content": prompt})

                payload = {
                    "model": model,
                    "messages": messages,
                    "temperature": 0.3
                }
                res = requests.post(f"{settings.GROK_BASE_URL}/chat/completions", headers=headers, json=payload, timeout=20)
                if res.status_code == 200:
                    data = res.json()
                    return data["choices"][0]["message"]["content"].strip()
                else:
                    logger.error(f"Grok API Error: {res.status_code} {res.text}")
            except Exception as e:
                logger.error(f"Grok call failed: {e}")

        # 3. OmniRoute
        elif provider == "omniroute":
            try:
                model = model_name or settings.OMNIROUTE_MODEL
                headers = {
                    "Authorization": f"Bearer {settings.OMNIROUTE_API_KEY}",
                    "Content-Type": "application/json"
                }
                messages = []
                if system_instruction:
                    messages.append({"role": "system", "content": system_instruction})
                messages.append({"role": "user", "content": prompt})

                payload = {
                    "model": model,
                    "messages": messages,
                    "temperature": 0.3
                }
                res = requests.post(f"{settings.OMNIROUTE_BASE_URL}/chat/completions", headers=headers, json=payload, timeout=20)
                if res.status_code == 200:
                    data = res.json()
                    return data["choices"][0]["message"]["content"].strip()
                else:
                    logger.error(f"OmniRoute API Error: {res.status_code} {res.text}")
            except Exception as e:
                logger.error(f"OmniRoute call failed: {e}")

        # 4. Google Gemini
        elif provider == "gemini":
            try:
                selected_model = model_name or settings.GEMINI_MODEL
                model = _gemini_client.GenerativeModel(
                    model_name=selected_model,
                    system_instruction=system_instruction
                )
                response = model.generate_content(prompt)
                return response.text.strip()
            except Exception as e:
                logger.error(f"Gemini generation error: {e}")

        # Fallback simulation
        return LLMService._simulate_text_response(prompt)

    @staticmethod
    def generate_structured_json(prompt: str, system_instruction: Optional[str] = None, model_name: Optional[str] = None, meta: Optional[dict] = None) -> Dict[str, Any]:
        """Generates validated JSON structure across OpenRouter, Grok, OmniRoute, or Gemini"""
        full_sys = (system_instruction or "") + "\nCRITICAL: You MUST output ONLY a valid JSON object. No preambles, no conversational wrapping, only parseable JSON."
        
        # Build system instruction via centralized resolver if not provided
        final_sys = system_instruction
        try:
            if not final_sys:
                from app.context_resolver import build_system_prompt
                final_sys = build_system_prompt(mode="GENERAL")
        except Exception:
            final_sys = system_instruction or ""

        # Append CRITICAL JSON-only directive
        full_sys = (final_sys or "") + "\nCRITICAL: You MUST output ONLY a valid JSON object. No preambles, no conversational wrapping, only parseable JSON."

        # DEBUG LOGGING: log metadata and final prompts before calling LLM
        try:
            import logging as _lg
            _lg.getLogger(__name__).info("LLM.generate_structured_json called with meta:")
            _lg.getLogger(__name__).info(f"meta={meta}")
            _lg.getLogger(__name__).info(f"FINAL_SYSTEM_PROMPT_PREVIEW: {(final_sys or '')[:300].replace('\n',' ')}")
            _lg.getLogger(__name__).info(f"USER_PROMPT_PREVIEW: {prompt[:500].replace('\n',' ')}")
        except Exception:
            pass
        raw_text = LLMService.generate_text(prompt, system_instruction=full_sys, model_name=model_name)
        if raw_text:
            cleaned = LLMService._clean_json_string(raw_text)
            try:
                return json.loads(cleaned)
            except Exception:
                # Try regex JSON block extraction
                match = re.search(r'(\{[\s\S]*\})', raw_text)
                if match:
                    try:
                        return json.loads(match.group(1))
                    except Exception:
                        pass

        return LLMService._simulate_json_response(prompt)

    @staticmethod
    def _clean_json_string(raw: str) -> str:
        raw = raw.strip()
        if raw.startswith("```"):
            raw = re.sub(r"^```(?:json)?\s*", "", raw)
            raw = re.sub(r"\s*```$", "", raw)
        return raw.strip()

    @staticmethod
    def _simulate_text_response(prompt: str) -> str:
        return "Hello! I'm your AI Mentor. Ask a question or upload material and I'll respond based on the current context."

    @staticmethod
    def _simulate_json_response(prompt: str) -> Dict[str, Any]:
        # Generic structured fallback: keep subject-agnostic placeholders
        return {
            "message": "Let's explore this idea together. Please provide more details or upload material for grounding.",
            "spoken_script": "That's interesting — here's a concise starting point based on your question.",
            "visual_notes": {
                "title": "Key Concept",
                "formula_latex": None,
                "bullet_points": ["State the core mechanism", "Give a concise example", "Show step-by-step reasoning"],
                "analogy": "Provide a domain-agnostic analogy relevant to the student's question."
            },
            "citations": [],
            "suggested_followups": ["Can you share an example?", "Would you like a visual or step-by-step explanation?"],
            "emotion": "neutral"
        }
