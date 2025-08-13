import os
import pdfplumber
import docx
from typing import Optional

def extract_text_from_pdf(path: str) -> str:
    text_pages = []
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            t = page.extract_text()
            if t:
                text_pages.append(t)
    return "\n".join(text_pages)

def extract_text_from_docx(path: str) -> str:
    doc = docx.Document(path)
    paragraphs = [p.text for p in doc.paragraphs if p.text and not p.text.isspace()]
    return "\n".join(paragraphs)

def extract_text_from_file(path: str) -> str:
    lower = path.lower()
    if lower.endswith(".pdf"):
        return extract_text_from_pdf(path)
    elif lower.endswith(".docx") or lower.endswith(".doc"):
        return extract_text_from_docx(path)
    else:
        # plain text fallback
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
