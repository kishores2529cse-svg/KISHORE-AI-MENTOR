from typing import Dict, Any, Optional
from app.services.llm_service import LLMService

class VisualPlanner:
    @staticmethod
    def plan_visual(concept: str, topic: str, visual_type: str = "diagram", details: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Generates rich deterministic & AI educational visualization blueprints for arbitrary subjects"""
        # Create a subject-agnostic conceptual visual blueprint
        title = f"{concept}" if concept else "Conceptual Blueprint"
        base = {
            "category": "concept_map",
            "visual_type": visual_type or "diagram",
            "title": title,
            "nodes": [
                {"id": "root", "label": "Core Idea", "type": "root"},
                {"id": "target", "label": concept or "Target Concept", "type": "target"},
                {"id": "application", "label": "Applications", "type": "result"}
            ],
            "edges": [
                {"from": "root", "to": "target", "label": "explains"},
                {"from": "target", "to": "application", "label": "applies"}
            ],
            "steps": [
                "1. State the core mechanism or definition",
                "2. Provide an intuitive example or analogy",
                "3. Show a simple step-by-step walkthrough",
                "4. List common misconceptions and edge cases"
            ]
        }

        # Allow light LLM-driven augmentation if available
        try:
            if LLMService and hasattr(LLMService, 'generate_structured_json'):
                prompt = f"Create a concise visual blueprint for the concept: {concept}. Output as JSON with nodes, edges, title, and 3 steps."
                augmented = LLMService.generate_structured_json(prompt)
                if isinstance(augmented, dict) and augmented.get('title'):
                    return augmented
        except Exception:
            pass

        return base
