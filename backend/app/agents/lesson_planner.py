import uuid
from typing import Optional, Dict, Any
from app.models.schemas import CreateLessonRequest, LessonPlan, LessonSegment
from app.services.llm_service import LLMService

class LessonPlanner:
    @staticmethod
    def create_plan(request: CreateLessonRequest, rag_context: Optional[str] = None) -> LessonPlan:
        topic_title = request.topic or "Educational Concept"
        
        prompt = f"""
    Design a highly structured, adaptive pedagogical lesson plan.

    Student Details:
    - Topic: {topic_title}
    - Level: {request.level}
    - Preferred Language: {request.language}
    - Target Duration: {request.duration_minutes} minutes
    - Teaching Style: {request.teaching_style}
    - Learning Objective: {request.learning_objective}
    - Depth: {request.desired_depth}
    {f"- Grounding Material Extract: {rag_context[:1000]}" if rag_context else ""}

    Requirements:
    1. Break down the topic into 3 to 5 logical, progressive segments.
    2. For each segment, provide:
       - concept name
       - specific objective
       - estimated duration in minutes
       - explanation strategy (e.g., analogy, visual, first principles, socratic)
       - vivid concrete example
       - visual_type: diagram | equation | code | chart | analogy
       - question_type: mcq | conceptual | application | problem_solving
       - expected_mastery: float (e.g. 0.85)
       - difficulty: easy | medium | hard
    3. Return valid JSON matching the LessonPlan structure.
    """
        meta = {"mode": "MATERIAL" if rag_context else "GENERAL", "material_id": None}
        data = LLMService.generate_structured_json(prompt, system_instruction=None, meta=meta)
        
        # Ensure fallback safety
        lesson_id = f"lsn_{uuid.uuid4().hex[:8]}"
        segments = []
        raw_segments = data.get("lesson_segments", [])
        if not raw_segments:
            # Fallback segments
            raw_segments = [
                {
                    "concept": f"Foundations of {topic_title}",
                    "objective": "Understand primary definition & mental model",
                    "estimated_duration_minutes": max(1, request.duration_minutes // 3),
                    "explanation_strategy": "Analogy + First Principles",
                    "example": f"Core real-world example of {topic_title}",
                    "visual_type": "diagram",
                    "visual_data": {"type": "conceptual_diagram"},
                    "question_type": "conceptual",
                    "expected_mastery": 0.8,
                    "difficulty": "easy"
                },
                {
                    "concept": f"Mechanism & Working of {topic_title}",
                    "objective": "Grasp how variables interact dynamically",
                    "estimated_duration_minutes": max(2, request.duration_minutes // 3),
                    "explanation_strategy": "Step-by-step physical breakdown",
                    "example": "Interactive component behavior",
                    "visual_type": "equation" if any(w in topic_title.lower() for w in ["math", "calculus", "physics", "formula"]) else "code" if any(w in topic_title.lower() for w in ["python", "code", "programming", "sql", "network", "dbms"]) else "diagram",
                    "visual_data": {"type": "mechanism_flow"},
                    "question_type": "application",
                    "expected_mastery": 0.85,
                    "difficulty": "medium"
                },
                {
                    "concept": f"Practical Application & Edge Cases",
                    "objective": "Apply principles to solve non-trivial scenarios",
                    "estimated_duration_minutes": max(2, request.duration_minutes // 3),
                    "explanation_strategy": "Real-world problem solving",
                    "example": "Troubleshooting & optimization",
                    "visual_type": "chart",
                    "visual_data": {"type": "application_chart"},
                    "question_type": "problem_solving",
                    "expected_mastery": 0.9,
                    "difficulty": "medium"
                }
            ]

        for s in raw_segments:
            segments.append(LessonSegment(
                concept=s.get("concept", "Core Concept"),
                objective=s.get("objective", "Master key principle"),
                estimated_duration_minutes=s.get("estimated_duration_minutes", 5),
                explanation_strategy=s.get("explanation_strategy", "Visual Analogy"),
                example=s.get("example", "Everyday analogy"),
                visual_type=s.get("visual_type", "diagram"),
                visual_data=s.get("visual_data", {}),
                question_type=s.get("question_type", "conceptual"),
                expected_mastery=float(s.get("expected_mastery", 0.85)),
                difficulty=s.get("difficulty", "easy")
            ))

        return LessonPlan(
            lesson_id=lesson_id,
            topic=data.get("topic", topic_title),
            level=request.level,
            language=request.language,
            duration_minutes=request.duration_minutes,
            teaching_style=request.teaching_style,
            learning_objective=request.learning_objective,
            objectives=data.get("objectives", [f"Gain deep intuition of {topic_title}", "Apply principles to solve problems without rote memorization"]),
            prerequisites=data.get("prerequisites", ["Fundamental interest in learning"]),
            concepts=[seg.concept for seg in segments],
            lesson_segments=segments,
            visual_strategy=data.get("visual_strategy", {"primary": "subject_visualizer"}),
            summary=data.get("summary", f"Personalized {request.duration_minutes}-minute interactive mastery journey for {topic_title}.")
        )
