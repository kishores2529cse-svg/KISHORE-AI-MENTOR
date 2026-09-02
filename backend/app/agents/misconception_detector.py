from typing import Dict, Any, Optional
from app.models.schemas import Question, StudentState
from app.services.llm_service import LLMService

class MisconceptionDetector:
    @staticmethod
    def detect(
        concept: str,
        question: Question,
        student_answer: str,
        state: StudentState
    ) -> Dict[str, Any]:
        
        prompt = f"""
    Detect if a student's answer reveals a fundamental conceptual flaw versus a simple typo or slip.

    Context:
    - Concept: {concept}
    - Question: {question.question}
    - Correct Intuition: {question.expected_answer}
    - Student's Answer: "{student_answer}"
    - Known Misconception Catalog: {question.misconception_mapping}

    Diagnostic Goal:
    1. Determine if a misconception exists (has_misconception: true/false).
    2. Label the exact misconception.
    3. Determine the cognitive origin.
    4. Recommend the best counter-strategy.

    Output valid JSON with keys: has_misconception, misconception_title, cognitive_origin, recommended_pedagogy, explanation_pivot
    """
        meta = {"mode": "GENERAL", "material_id": None, "concept": concept}
        data = LLMService.generate_structured_json(prompt, system_instruction=None, meta=meta)

        return {
            "has_misconception": data.get("has_misconception", False),
            "misconception_title": data.get("misconception_title", f"Conceptual Gap in {concept}"),
            "cognitive_origin": data.get("cognitive_origin", "Incomplete mental model of the underlying mechanism."),
            "recommended_pedagogy": data.get("recommended_pedagogy", "INTERACTIVE_VISUAL"),
            "explanation_pivot": data.get("explanation_pivot", f"Provide a concrete visual example illustrating {concept}.")
        }
