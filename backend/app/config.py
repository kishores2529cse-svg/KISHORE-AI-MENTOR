import os
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    PROJECT_NAME: str = "KISHORE S AI Mentor"
    TAGLINE: str = "It doesn't just answer. It understands how you learn."
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    CORS_ORIGINS: list[str] = [
        origin.strip() 
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000").split(",")
    ]
    
    # Provider Selection: "openrouter" | "grok" | "omniroute" | "gemini" | "auto"
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "auto")
    
    # 1. OpenRouter Configuration (Supports Grok, Gemini, DeepSeek, Claude)
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_MODEL: str = os.getenv("OPENROUTER_MODEL", "x-ai/grok-2")
    OPENROUTER_BASE_URL: str = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")

    # 2. Grok / xAI Configuration
    GROK_API_KEY: str = os.getenv("GROK_API_KEY", os.getenv("XAI_API_KEY", ""))
    GROK_MODEL: str = os.getenv("GROK_MODEL", "grok-2-latest")
    GROK_BASE_URL: str = os.getenv("GROK_BASE_URL", "https://api.x.ai/v1")

    # 3. OmniRoute / Custom OpenAI-Compatible Base
    OMNIROUTE_API_KEY: str = os.getenv("OMNIROUTE_API_KEY", "")
    OMNIROUTE_BASE_URL: str = os.getenv("OMNIROUTE_BASE_URL", "https://api.omniroute.ai/v1")
    OMNIROUTE_MODEL: str = os.getenv("OMNIROUTE_MODEL", "grok-2")

    # 4. Google Gemini Configuration
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    GEMINI_REASONING_MODEL: str = os.getenv("GEMINI_REASONING_MODEL", "gemini-3.7-flash")
    
    # Features
    ENABLE_FALLBACK_SIMULATION: bool = os.getenv("ENABLE_FALLBACK_SIMULATION", "true").lower() == "true"
    SPEECH_ENGINE: str = os.getenv("SPEECH_ENGINE", "web_speech")
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")

settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
