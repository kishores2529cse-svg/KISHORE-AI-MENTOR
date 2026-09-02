import uuid
import os
from typing import Dict, Any, Optional, List, Tuple
from app.rag.ingestion import DocumentIngestion
from app.rag.retrieval import GroundedRetrieval

# In-memory vector / document store keyed strictly by material_id / document_id
_DOCUMENT_STORE: Dict[str, Dict[str, Any]] = {}

class RAGService:
    @staticmethod
    def process_and_index_file(file_path: str, filename: str) -> Dict[str, Any]:
        """Indexes an uploaded material file into the local RAG store with complete metadata"""
        doc_id = f"doc_{uuid.uuid4().hex[:8]}"
        extracted = DocumentIngestion.extract_text_from_file(file_path, filename)
        chunks = DocumentIngestion.chunk_text(
            text=extracted,
            document_id=doc_id,
            document_name=filename,
            chunk_size=600,
            overlap=100
        )
        
        # Extract prominent topic suggestions from text
        first_lines = extracted[:800].split("\n")
        topics_found = [
            line.strip("# -*:\t") 
            for line in first_lines 
            if len(line.strip("# -*:\t")) > 4 and not line.strip().startswith("[Page")
        ][:5]
        
        if not topics_found:
            clean_name = os.path.splitext(filename)[0].replace("_", " ").replace("-", " ")
            topics_found = [clean_name]

        doc_record = {
            "document_id": doc_id,
            "material_id": doc_id,
            "filename": filename,
            "file_path": file_path,
            "raw_text": extracted,
            "chunks": chunks,
            "topics_found": topics_found,
            "chunk_count": len(chunks)
        }
        
        _DOCUMENT_STORE[doc_id] = doc_record
        return doc_record

    @staticmethod
    def get_document(doc_id: str) -> Optional[Dict[str, Any]]:
        return _DOCUMENT_STORE.get(doc_id)

    @staticmethod
    def remove_document(doc_id: str) -> bool:
        """Removes a document and purges its indexed chunks from memory"""
        if doc_id in _DOCUMENT_STORE:
            del _DOCUMENT_STORE[doc_id]
            return True
        return False

    @staticmethod
    def list_documents() -> List[Dict[str, Any]]:
        """Lists all currently indexed materials"""
        return [
            {
                "document_id": d["document_id"],
                "filename": d["filename"],
                "topics_found": d["topics_found"],
                "chunk_count": d["chunk_count"]
            }
            for d in _DOCUMENT_STORE.values()
        ]

    @staticmethod
    def retrieve_grounding(doc_id: str, query: str) -> Tuple[str, List[str], bool]:
        """
        Returns:
            - formatted_context: string of grounded excerpts
            - citations: list of citation strings with page/chunk info
            - found: boolean whether relevant content was found in the material
        """
        doc = _DOCUMENT_STORE.get(doc_id)
        if not doc:
            return "", [], False

        chunks = doc.get("chunks", [])
        top_chunks = GroundedRetrieval.retrieve_relevant_chunks(
            query=query,
            chunks=chunks,
            active_material_id=doc_id,
            top_k=3,
            min_score=1
        )

        if not top_chunks:
            # Material is attached but query not found in the material
            summary_excerpt = f"[DOCUMENT: {doc['filename']}] (Note: The student's specific question was not directly matched in the uploaded text excerpts)."
            return summary_excerpt, [f"Source: {doc['filename']}"], False

        citations = []
        formatted = f"[GROUNDED MATERIAL SOURCE: {doc['filename']}]\n"
        for c in top_chunks:
            page_info = f" (Page {c.get('page_number', 1)})" if c.get('page_number') else ""
            formatted += f"\n--- Excerpt {c['chunk_id']}{page_info} (Relevance Score: {c.get('relevance_score', 0)}) ---\n{c['content']}\n"
            citations.append(f"{doc['filename']}{page_info}")

        # Deduplicate citations
        unique_citations = list(dict.fromkeys(citations))
        return formatted, unique_citations, True
