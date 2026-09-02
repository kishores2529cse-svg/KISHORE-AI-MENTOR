from typing import Dict, Any, Optional
from app.models.schemas import AnswerEvaluation, Question, StudentState
from app.services.llm_service import LLMService

class EvaluatorAgent:
    @staticmethod
    def evaluate_answer(
        question: Question,
        student_answer: str,
        state: StudentState,
        teaching_style: str = "Visual"
    ) -> AnswerEvaluation:
        
        prompt = f"""
    Evaluate student conceptual understanding given the question context and student response.

    Question Context:
    - Concept: {question.concept}
    - Question Asked: "{question.question}"
    - Expected Conceptual Understanding: "{question.expected_answer}"
    - Acceptable Answer Variations: {question.acceptable_variations}
    - Known Misconception Catalog: {question.misconception_mapping}

    Student Response:
    "{student_answer}"

    Student Profile:
    - Level: {state.student_level}
    - Current Concept Mastery: {state.mastery.get(question.concept, 0.4)}
    - Preferred Style: {teaching_style}

    Evaluation Rules:
    1. Determine correctness and, if incorrect, identify cognitive misconception.
    2. Compute mastery change and recommend pedagogical action.
    3. Provide constructive teacher feedback suitable for TTS.

    Output valid JSON with keys: correct, score, confidence, reason, misconception, misconception_root_cause, mastery_change, recommended_action, next_strategy, teacher_feedback
    """
        meta = {"mode": "GENERAL", "material_id": None, "question_concept": question.concept}
        data = LLMService.generate_structured_json(prompt, system_instruction=None, meta=meta)

        is_correct = data.get("correct")
        if is_correct is None:
            # Lexical matching fallback
            cleaned_ans = student_answer.strip().lower()
            expected_lower = question.expected_answer.lower()
            variations = [v.lower() for v in (question.acceptable_variations or [])]
            
            if any(v in cleaned_ans for v in variations) or (expected_lower and expected_lower in cleaned_ans):
                is_correct = True
            else:
                is_correct = False

        curr_mastery = state.mastery.get(question.concept, 0.45)
        m_change = data.get("mastery_change")
        if m_change is None:
            m_change = 0.35 if is_correct else -0.10
        new_mastery = max(0.0, min(1.0, round(curr_mastery + float(m_change), 2)))

        default_feedback = (
            f"Spot on! That is exactly correct. You have grasped the fundamental intuition of {question.concept}."
            if is_correct else
            f"Not quite. Let's look closer at the mechanism of {question.concept} so we can clear up this nuance."
        )

        return AnswerEvaluation(
            correct=is_correct,
            score=float(data.get("score", 1.0 if is_correct else 0.2)),
            confidence=float(data.get("confidence", 0.9)),
            reason=data.get("reason", "Answer evaluated against expected intuition."),
            misconception=data.get("misconception"),
            misconception_root_cause=data.get("misconception_root_cause"),
            mastery_change=float(m_change),
            new_mastery=new_mastery,
            recommended_action=data.get("recommended_action", "CONTINUE" if is_correct else "REEXPLAIN"),
            next_strategy=data.get("next_strategy", "VISUAL_DIAGRAM"),
            teacher_feedback=data.get("teacher_feedback", default_feedback)
        )
