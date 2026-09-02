from typing import Dict, Any, Optional
from app.models.schemas import TeacherExplanation, Question
from app.services.llm_service import LLMService

class TeacherAgent:
    @staticmethod
    def explain_concept(
        concept: str,
        topic: str,
        student_level: str,
        teaching_style: str,
        language: str,
        rag_context: Optional[str] = None,
        strategy_override: Optional[str] = None,
        previous_misconception: Optional[str] = None,
        material_id: Optional[str] = None,
        session_id: Optional[str] = None
    ) -> TeacherExplanation:
        mode_str = "MATERIAL" if rag_context else "GENERAL"

        prompt = f"""
Current Session Context:
- Mode: {mode_str}
- Topic: {topic}
- Concept: {concept}
- Student Level: {student_level}
- Teaching Style: {strategy_override or teaching_style}
- Language: {language}
{f"- Grounded Document Material:\n{rag_context}\n" if rag_context else ""}
{f"- Previous Student Misconception to Clarify: {previous_misconception}\n" if previous_misconception else ""}

Pedagogical Guidelines:
1. If material is present, ground the explanation strictly in the provided document excerpts.
2. Deliver an articulate, conversational spoken-style explanation (2-3 sentences) suitable for live AI video avatar.
3. Provide an intuitive analogy, a real-world application, and 3 clear bullet takeaways.
4. Provide a suggested diagnostic question for checking student understanding.

Output pure JSON:
{{
  "concept": "{concept}",
  "teaching_style": "{strategy_override or teaching_style}",
  "spoken_text": "Conversational spoken explanation for live avatar...",
  "bullet_points": ["Key point 1", "Key point 2", "Key point 3"],
  "analogy": "Memorable intuition or analogy...",
  "practical_example": "Concrete application...",
  "visual_spec": {{
    "type": "diagram" | "flowchart" | "code" | "equation",
    "title": "{concept} Intuition"
  }},
  "grounded_in_rag": {str(bool(rag_context)).lower()},
  "rag_citations": [],
  "suggested_question": {{
    "question": "Diagnostic question...",
    "expected_answer": "Key expected intuition...",
    "acceptable_variations": [],
    "difficulty": "easy"
  }}
}}
"""

        system_instruction = "You are KISHORE AI Mentor, an empathetic, intuitive AI Mentor and Teacher. Output pure JSON."
        data = LLMService.generate_structured_json(prompt, system_instruction)

        q_data = data.get("suggested_question", {})
        if q_data and q_data.get("question"):
            question_obj = Question(
                question_id=q_data.get("question_id", f"q_{concept[:4].lower()}"),
                concept=concept,
                question=q_data.get("question", f"What is the fundamental mechanism behind {concept}?"),
                question_type=q_data.get("question_type", "conceptual"),
                options=q_data.get("options"),
                expected_answer=q_data.get("expected_answer", f"Core intuitive principle of {concept}"),
                acceptable_variations=q_data.get("acceptable_variations", []),
                difficulty=q_data.get("difficulty", "easy"),
                misconception_mapping=q_data.get("misconception_mapping", {}),
                hints=q_data.get("hints", [f"Think about cause and effect in {concept}."])
            )
        else:
            question_obj = Question(
                question_id=f"q_{concept[:4].lower()}_1",
                concept=concept,
                question=f"In your own words, how would you explain the core mechanism of {concept}?",
                question_type="conceptual",
                expected_answer=f"Understanding of {concept}",
                acceptable_variations=[],
                difficulty="easy",
                hints=[f"Focus on the primary function and purpose of {concept}."]
            )

        spoken = data.get("spoken_text") or f"Let's explore {concept}. We'll build a clear step-by-step model so you understand the intuition rather than memorizing."

        visual_fallback = {
            "type": data.get("visual_spec", {}).get("type", "diagram"),
            "title": data.get("visual_spec", {}).get("title", f"{concept} Overview"),
            "details": data.get("visual_spec", {}).get("details", {})
        }

        return TeacherExplanation(
            concept=concept,
            teaching_style=data.get("teaching_style", strategy_override or teaching_style),
            spoken_text=spoken,
            bullet_points=data.get("bullet_points", [
                f"Core foundation of {concept}",
                f"How {concept} works in practice",
                "Intuitive cause-and-effect model"
            ]),
            analogy=data.get("analogy", f"An intuitive analogy for {concept}"),
            practical_example=data.get("practical_example", "A concrete real-world application."),
            visual_spec=visual_fallback,
            grounded_in_rag=data.get("grounded_in_rag", bool(rag_context)),
            rag_citations=data.get("rag_citations", []),
            suggested_question=question_obj
        )
