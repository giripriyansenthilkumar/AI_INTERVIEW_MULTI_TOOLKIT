import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from config.settings import UPLOAD_AUDIO_DIR
from models.whisper.transcribe import transcribe_file
from models.gemini import generate_response as generate
import uuid
import re

ALLOWED_AUDIO_EXT = {"wav", "mp3", "m4a", "ogg", "webm"}

interview_bp = Blueprint("interview", __name__)

def allowed(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_AUDIO_EXT

@interview_bp.route("/upload_audio", methods=["POST"])
def upload_audio():
    """
    Expects form-data with key 'audio' (file).
    Returns: { text: "<transcript>", ai_question: "<next Q>" }
    """
    if "audio" not in request.files:
        return jsonify({"error": "audio file required under 'audio'"}), 400

    f = request.files["audio"]
    if f.filename == "":
        return jsonify({"error": "empty filename"}), 400

    if not allowed(f.filename):
        return jsonify({"error": "unsupported audio format"}), 400

    filename = secure_filename(f.filename)
    unique_name = f"{uuid.uuid4().hex}_{filename}"
    save_path = os.path.join(UPLOAD_AUDIO_DIR, unique_name)
    f.save(save_path)

    # 1) Whisper transcription
    try:
        transcript_data = transcribe_file(save_path, language="en")
        user_text = transcript_data.get("text", "")
    except Exception as e:
        current_app.logger.exception("transcription error")
        return jsonify({"error": "transcription failed", "detail": str(e)}), 500

    # 2) LLaMA — produce a follow-up question or short feedback
    # You can craft a richer system prompt for multi-turn behaviour
    prompt = (
        "You are a friendly technical interviewer. The candidate said:\n\n"
        f"\"{user_text}\"\n\n"
        "Respond with a short follow-up question that probes depth or asks for an example. "
        "Keep it concise (<= 40 words). Also return a 1-10 confidence guess about the answer in the format: CONFIDENCE: <n>."
    )
    try:
        ai_out = generate(prompt, max_tokens=128)
    except Exception as e:
        current_app.logger.exception("llama generation failed")
        ai_out = "Sorry, I couldn't generate a follow-up question right now."

    return jsonify({
        "transcript": user_text,
        "ai": ai_out
    })

@interview_bp.route("/end_interview", methods=["POST"])
def end_interview():
    data = request.json
    conversation_log = data.get("conversation_log", [])
    # Aggregate feedback and scores
    strengths = []
    improvements = []
    professionalism_scores = []
    preparation_scores = []
    communication_scores = []
    predicted_scores = []
    feedback_summaries = []
    overall_impressions = []
    answered_count = 0
    for entry in conversation_log:
        feedback = entry.get("feedback", "")
        answer = entry.get("answer", "")
        if answer.strip():
            answered_count += 1
        # Parse Gemini feedback format
        # Extract scores and bullet points
        def extract_score(label):
            m = re.search(rf"{label}:\s*(\d+)", feedback)
            return int(m.group(1)) if m else None
        def extract_section(label):
            m = re.search(rf"{label}:\s*(.*?)(?:\n[A-Z][a-zA-Z ]+:|$)", feedback, re.DOTALL)
            return m.group(1).strip() if m else ""
        professionalism_scores.append(extract_score("Professionalism"))
        preparation_scores.append(extract_score("Preparation"))
        communication_scores.append(extract_score("Communication"))
        predicted_scores.append(extract_score("Predicted Score"))
        strengths.append(extract_section("Strengths"))
        improvements.append(extract_section("Areas for Improvement"))
        feedback_summaries.append(extract_section("Feedback Summary"))
        overall_impressions.append(extract_section("Overall Impression"))
    def avg(scores):
        vals = [s for s in scores if s is not None]
        return round(sum(vals)/len(vals), 1) if vals else "N/A"
    summary = f"Interview Summary for {answered_count} answered question(s):\n\n"
    summary += f"Average Professionalism: {avg(professionalism_scores)}\n"
    summary += f"Average Preparation: {avg(preparation_scores)}\n"
    summary += f"Average Communication: {avg(communication_scores)}\n"
    summary += f"Average Predicted Score: {avg(predicted_scores)}\n\n"
    summary += "Key Strengths:\n"
    for s in strengths:
        for line in s.split("\n"):
            if line.strip():
                summary += f"• {line.strip()}\n"
    summary += "\nAreas for Improvement:\n"
    for imp in improvements:
        for line in imp.split("\n"):
            if line.strip():
                summary += f"• {line.strip()}\n"
    summary += "\nFeedback Summaries:\n"
    for fs in feedback_summaries:
        if fs:
            summary += f"- {fs}\n"
    summary += "\nOverall Impressions:\n"
    for oi in overall_impressions:
        if oi:
            summary += f"- {oi}\n"
    if answered_count == 0:
        summary += "\nYou did not provide any answers. Please try to answer the questions for a more meaningful evaluation."
    elif avg(predicted_scores) != "N/A" and avg(predicted_scores) < 5:
        summary += "\nYour overall score is low. Consider practicing more detailed and confident answers."
    return jsonify({"summary": summary})
