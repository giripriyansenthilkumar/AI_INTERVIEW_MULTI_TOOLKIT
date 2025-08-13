import re
from collections import Counter

def extract_keywords_from_jd(jd_text: str, top_n: int = 40):
    """
    Very simple keyword extraction: words longer than 2 letters, exclude stopwords,
    return most common terms.
    For production use: spaCy / RAKE / YAKE or an LLM-based extraction.
    """
    STOP = set([
        "and","the","with","for","in","is","a","an","to","of","on","by","as","at",
        "we","you","your","are","be","will","have","has","our"
    ])
    words = re.findall(r"[A-Za-z+#\.\-0-9]+", jd_text.lower())
    words = [w for w in words if len(w) > 2 and w not in STOP]
    freq = Counter(words)
    keywords = [w for w, _ in freq.most_common(top_n)]
    return keywords

def find_missing_keywords(resume_text: str, keywords: list):
    found = set()
    rt = resume_text.lower()
    for kw in keywords:
        if kw.lower() in rt:
            found.add(kw)
    missing = [k for k in keywords if k not in found]
    return missing
