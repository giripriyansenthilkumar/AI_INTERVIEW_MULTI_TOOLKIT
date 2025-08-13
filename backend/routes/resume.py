import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from config.settings import UPLOAD_RESUME_DIR, OUTPUT_RESUMES
from utils.pdf_parser import extract_text_from_file
from utils.keyword_matcher import extract_keywords_from_jd, find_missing_keywords
from models.gemini import generate_response as generate
import uuid

ALLOWED_RESUME_EXT = {"pdf", "docx", "doc", "txt"}

resume_bp = Blueprint("resume", __name__)

def allowed(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_RESUME_EXT

@resume_bp.route("/optimize", methods=["POST"])
def optimize():
    """
    Expects multipart form with:
      - 'resume' file
      - 'job_description' text field
    Returns: { optimized_path: "<url or path>", summary: ... }
    """
    if "resume" not in request.files:
        return jsonify({"error": "resume file required"}), 400
    jd = request.form.get("job_description", "").strip()
    if jd == "":
        return jsonify({"error": "job_description form field is required"}), 400

    file = request.files["resume"]
    if file.filename == "" or not allowed(file.filename):
        return jsonify({"error": "invalid or missing resume file"}), 400

    filename = secure_filename(file.filename)
    unique_name = f"{uuid.uuid4().hex}_{filename}"
    save_path = os.path.join(UPLOAD_RESUME_DIR, unique_name)
    file.save(save_path)

    # parse resume text
    try:
        resume_text = extract_text_from_file(save_path)
        current_app.logger.info(f"Extracted resume text ({len(resume_text)} chars):\n{resume_text[:1000]}{'...' if len(resume_text) > 1000 else ''}")
    except Exception as e:
        current_app.logger.exception("resume parsing error")
        return jsonify({"error": "failed to parse resume", "detail": str(e)}), 500

    # extract keywords from JD
    jd_keywords = extract_keywords_from_jd(jd)
    missing = find_missing_keywords(resume_text, jd_keywords)

    # Use Gemini to rewrite/improve resume for JD
    prompt = (
        "You are an expert resume writer and career coach.\n\n"
        "Job Description:\n"
        f"{jd}\n\n"
        "Candidate current resume text:\n"
        f"{resume_text}\n\n"
        "Task:\n"
        "1) Produce an optimized resume text that emphasizes relevant skills for the job description, "
        "adds ATS-friendly keywords, rewrites bullets into impactful results statements, and keeps content concise.\n"
        "2) After the resume, produce a short 'Change Summary' listing major edits and inserted keywords.\n\n"
        "Return the optimized resume, then '---CHANGE SUMMARY---' and the bullets."
    )

    try:
        optimized = generate(prompt)  # generate is already Gemini (see import)
    except Exception as e:
        current_app.logger.exception("gemini error")
        # Debug mode: return extracted resume text directly
        optimized = resume_text + "\n\n---CHANGE SUMMARY---\n(No Gemini optimization: this is your raw resume text)"

    # Parse Gemini response: split at ---CHANGE SUMMARY---
    resume_text, change_summary = optimized, ""
    if '---CHANGE SUMMARY---' in optimized:
        parts = optimized.split('---CHANGE SUMMARY---')
        resume_text = parts[0].strip()
        change_summary = parts[1].strip()
    # Parse change summary into bullets
    changes_explanation = []
    for line in change_summary.split('\n'):
        line = line.strip('-•* ').strip()
        if line:
            changes_explanation.append({"type": "added" if "add" in line.lower() else "modified", "description": line})

    # Save optimized text to outputs
    out_name = f"optimized_{uuid.uuid4().hex}.txt"
    out_path = os.path.join(OUTPUT_RESUMES, out_name)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(resume_text)

    response = {
        "optimized_resume": resume_text,
        "changes_explanation": changes_explanation,
        "optimized_path": out_path,
        "missing_keywords": missing,
        "summary_preview": resume_text[:1000]
    }
    return jsonify(response)
