from typing import Dict, Any, Optional
from app.models.schemas import AdaptiveAction, AnswerEvaluation, StudentState, Question
from app.services.llm_service import LLMService

class AdaptiveEngine:
    @staticmethod
    def decide_adaptation(
        evaluation: AnswerEvaluation,
        state: StudentState,
        current_concept: str,
        teaching_style: str = "Visual",
        time_remaining_minutes: int = 15
    ) -> AdaptiveAction:
        prompt = f"""
Decide the precise pedagogical intervention based on the student's evaluation and cognitive state.

Current Concept: {current_concept}
Answer Evaluation Correct: {evaluation.correct}
Evaluation Reason: {evaluation.reason}
Misconception Identified: {evaluation.misconception}
Current Concept Mastery: {evaluation.new_mastery}
Student Level: {state.student_level}
Time Remaining: {time_remaining_minutes} minutes
Preferred Teaching Style: {teaching_style}

Adaptation Rules:
1. If MISCONCEPTION DETECTED:
    - Action: REEXPLAIN
    - Strategy: Shift from technical to an intuitive analogy or concrete visual example
    - Generate a supportive spoken pivot script for the teacher
    - Generate a new, simpler diagnostic question to re-test the concept
2. If CORRECT & High Mastery (> 0.80):
    - Action: ADVANCE or INCREASE_DIFFICULTY
    - Strategy: PRACTICAL_APPLICATION or NEXT_CONCEPT
3. If WRONG without clear misconception:
    - Action: SIMPLIFY
    - Strategy: STEP_BY_STEP
    - Break the concept into smaller atomic pieces

Output pure JSON:
{{
  "action": "REEXPLAIN" | "SIMPLIFY" | "ADVANCE" | "INCREASE_DIFFICULTY",
  "strategy": "ANALOGY" | "VISUAL_DIAGRAM" | "CODE_EXAMPLE" | "STEP_BY_STEP",
  "difficulty": "easy" | "medium" | "hard",
  "reason": "Pedagogical rationale...",
  "teacher_speech": "Spoken encouraging explanation to student...",
  "visual_update": {{
    "type": "diagram" | "flowchart" | "code" | "equation",
    "title": "Visual Blueprint Title"
  }},
  "new_question": {{
    "question": "A follow-up question...",
    "expected_answer": "Expected key point...",
    "acceptable_variations": [],
    "difficulty": "easy"
  }}
}}
"""
        system_instruction = "You are an expert pedagogical adaptation engine. Output valid JSON only."
        data = LLMService.generate_structured_json(prompt, system_instruction)

        new_q = None
        if data.get("new_question"):
            nq = data["new_question"]
            new_q = Question(
                question_id=nq.get("question_id", f"q_{current_concept[:4].lower()}_adapt"),
                concept=current_concept,
                question=nq.get("question", f"Let's check your understanding of {current_concept} with a quick scenario:"),
                question_type=nq.get("question_type", "conceptual"),
                options=nq.get("options"),
                expected_answer=nq.get("expected_answer", f"Core understanding of {current_concept}"),
                acceptable_variations=nq.get("acceptable_variations", []),
                difficulty=nq.get("difficulty", "easy"),
                misconception_mapping=nq.get("misconception_mapping", {}),
                hints=nq.get("hints", [])
            )

        speech = data.get("teacher_speech")
        if not speech:
            speech = (
                f"Let's look at {current_concept} from another perspective so the core principle becomes crystal clear."
                if not evaluation.correct else
                f"Outstanding work on {current_concept}! You're ready for the next level."
            )

        return AdaptiveAction(
            action=data.get("action", "CONTINUE" if evaluation.correct else "REEXPLAIN"),
            strategy=data.get("strategy", "VISUAL_DIAGRAM"),
            difficulty=data.get("difficulty", "easy"),
            reason=data.get("reason", f"Pedagogical strategy updated for {current_concept}."),
            teacher_speech=speech,
            visual_update=data.get("visual_update", {
                "type": "diagram",
                "title": f"Adaptive Visual: {current_concept}"
            }),
            new_question=new_q
        )
