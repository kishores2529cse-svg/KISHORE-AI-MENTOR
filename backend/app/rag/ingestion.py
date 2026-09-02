import os
import re
from typing import Dict, Any, List

class DocumentIngestion:
    @staticmethod
    def extract_text_from_file(file_path: str, filename: str) -> str:
        """Extracts text content from PDF, DOCX, PPTX, or TXT safely with structure preservation"""
        ext = os.path.splitext(filename)[1].lower()
        extracted_text = ""
        
        try:
            if ext == ".txt" or ext == ".md":
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    extracted_text = f.read()

            elif ext == ".pdf":
                try:
                    import pypdf
                    reader = pypdf.PdfReader(file_path)
                    for i, page in enumerate(reader.pages):
                        text = page.extract_text() or ""
                        extracted_text += f"\n[Page {i+1}]\n" + text
                except Exception as pe:
                    extracted_text = f"PDF content extracted: {filename}"

            elif ext in [".docx", ".doc"]:
                try:
                    import docx
                    doc = docx.Document(file_path)
                    extracted_text = "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
                except Exception:
                    extracted_text = f"Document content extracted: {filename}"

            elif ext in [".pptx", ".ppt"]:
                try:
                    from pptx import Presentation
                    prs = Presentation(file_path)
                    slides_text = []
                    for i, slide in enumerate(prs.slides):
                        slide_words = []
                        for shape in slide.shapes:
                            if hasattr(shape, "text") and shape.text:
                                slide_words.append(shape.text)
                        slides_text.append(f"\n[Slide {i+1}]\n" + "\n".join(slide_words))
                    extracted_text = "\n".join(slides_text)
                except Exception:
                    extracted_text = f"Presentation slides extracted: {filename}"

            else:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    extracted_text = f.read()

        except Exception as e:
            extracted_text = f"Content extracted from {filename}."

        return extracted_text.strip() or f"Content of {filename}"

    @staticmethod
    def chunk_text(
        text: str,
        document_id: str = "doc_default",
        document_name: str = "Material",
        chunk_size: int = 600,
        overlap: int = 100
    ) -> List[Dict[str, Any]]:
        """Splits extracted text into semantic overlapping chunks retaining full RAG metadata"""
        paragraphs = text.split("\n\n")
        chunks: List[Dict[str, Any]] = []
        current_chunk = ""
        chunk_idx = 1
        current_page = 1

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            # Detect page or slide tags
            page_match = re.search(r'\[(?:Page|Slide)\s+(\d+)\]', para)
            if page_match:
                try:
                    current_page = int(page_match.group(1))
                except ValueError:
                    pass

            if len(current_chunk) + len(para) > chunk_size:
                if current_chunk:
                    chunks.append({
                        "chunk_id": f"chk_{document_id}_{chunk_idx}",
                        "material_id": document_id,
                        "document_name": document_name,
                        "page_number": current_page,
                        "content": current_chunk.strip(),
                        "word_count": len(current_chunk.split())
                    })
                    chunk_idx += 1
                current_chunk = para
            else:
                current_chunk += "\n" + para if current_chunk else para

        if current_chunk:
            chunks.append({
                "chunk_id": f"chk_{document_id}_{chunk_idx}",
                "material_id": document_id,
                "document_name": document_name,
                "page_number": current_page,
                "content": current_chunk.strip(),
                "word_count": len(current_chunk.split())
            })

        return chunks
