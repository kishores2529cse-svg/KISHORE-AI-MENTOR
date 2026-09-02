from typing import Optional, Dict

def resolve_context(session_id: Optional[str], material_id: Optional[str]) -> Dict[str, Optional[str]]:
    """Centralized resolver for runtime context.

    Returns:
      {"mode": "GENERAL" | "MATERIAL", "material_id": Optional[str]}
    """
    if material_id:
        return {"mode": "MATERIAL", "material_id": material_id}
    return {"mode": "GENERAL", "material_id": None}


def build_system_prompt(mode: str = "GENERAL") -> str:
    """Return a subject-agnostic system prompt tailored to the current context mode."""
    base = (
        "You are an empathetic, human-like AI Mentor. Follow the student's current question and the provided learning material (if any). "
        "Always ground answers in the uploaded material when mode is MATERIAL. If no material exists (GENERAL), respond directly to the student's question without assuming any fixed subject. "
        "Keep responses concise and clear; preserve exact mentor responses for TTS output."
    )
    if mode == "MATERIAL":
        return base + "\nContext Mode: MATERIAL — prioritize uploaded material for retrieval and RAG grounding."
    return base + "\nContext Mode: GENERAL — no uploaded material; follow the student's prompt."
