from flask import Blueprint, request, jsonify
from models.gemini import generate_response

gemini_bp = Blueprint('gemini', __name__)

@gemini_bp.route('/generate', methods=['POST'])
def generate():
    data = request.json
    prompt = data.get('prompt', '')
    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400

    try:
        # If this is an interview answer evaluation, enforce professional feedback format
        if 'Evaluate the following interview answer' in prompt:
            prompt += (
                "\n\nPlease provide feedback in the following format:\n"
                "Feedback Summary: (summarize strengths and weaknesses)\n"
                "Professionalism: (score 1-10)\n"
                "Preparation: (score 1-10)\n"
                "Communication: (score 1-10)\n"
                "Strengths: (bullet points)\n"
                "Areas for Improvement: (bullet points)\n"
                "Overall Impression: (short summary)\n"
                "Predicted Score: (1-10)\n"
                "Follow-up Technical Question: (one question relevant to the role)\n"
            )
        response = generate_response(prompt)
        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
