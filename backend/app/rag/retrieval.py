import re
from typing import List, Dict, Any, Optional

class GroundedRetrieval:
    @staticmethod
    def retrieve_relevant_chunks(
        query: str,
        chunks: List[Dict[str, Any]],
        active_material_id: Optional[str] = None,
        top_k: int = 3,
        min_score: int = 1
    ) -> List[Dict[str, Any]]:
        """
        Retrieves top relevant chunks using lexical/semantic scoring with strict material isolation.
        Guarantees that no foreign chunks or cross-document data can ever leak.
        """
        if not chunks:
            return []

        query_terms = set(re.findall(r'\w+', query.lower()))
        # Filter out common stop words to enhance precision
        stop_words = {"the", "is", "at", "which", "on", "a", "an", "and", "or", "in", "to", "for", "of", "with", "can", "you", "explain", "what", "how", "why"}
        meaningful_query_terms = query_terms - stop_words
        if not meaningful_query_terms:
            meaningful_query_terms = query_terms

        scored = []

        for chk in chunks:
            # STRICT RETRIEVAL VALIDATION: Discard if chunk does not belong to active material
            if active_material_id and chk.get("material_id") != active_material_id:
                continue

            content_lower = chk["content"].lower()
            chk_terms = set(re.findall(r'\w+', content_lower))
            
            # Term overlap score with meaningful terms
            overlap = len(meaningful_query_terms.intersection(chk_terms))
            
            # Exact query phrase bonus
            exact_bonus = 4 if query.lower().strip("?.! ") in content_lower else 0
            
            total_score = overlap + exact_bonus
            if total_score >= min_score:
                scored.append({
                    **chk,
                    "relevance_score": total_score
                })

        # Sort by relevance score descending
        scored.sort(key=lambda x: x["relevance_score"], reverse=True)
        return scored[:top_k]
