import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)

# upload / output folders
UPLOAD_DIR = os.path.join(PROJECT_ROOT, "uploads")
UPLOAD_AUDIO_DIR = os.path.join(UPLOAD_DIR, "audio")
UPLOAD_RESUME_DIR = os.path.join(UPLOAD_DIR, "resumes")

OUTPUT_DIR = os.path.join(PROJECT_ROOT, "outputs")
OUTPUT_RESUMES = os.path.join(OUTPUT_DIR, "resumes")
OUTPUT_REPORTS = os.path.join(OUTPUT_DIR, "reports")

# ensure subfolders exist
for d in (UPLOAD_DIR, UPLOAD_AUDIO_DIR, UPLOAD_RESUME_DIR, OUTPUT_DIR, OUTPUT_RESUMES, OUTPUT_REPORTS):
    os.makedirs(d, exist_ok=True)


# Whisper config
WHISPER_MODEL = os.getenv("WHISPER_MODEL", "base")  # tiny, base, small, medium, large

# SerpAPI (optional) for research agent
SERPAPI_KEY = os.getenv("SERPAPI_KEY", "")
