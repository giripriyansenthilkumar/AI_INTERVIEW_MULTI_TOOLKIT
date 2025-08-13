from flask import Blueprint, request, jsonify, current_app
from utils.web_scraper import quick_company_overview
from models.gemini import generate_response as generate

research_bp = Blueprint("research", __name__)

@research_bp.route("/company_role", methods=["POST"])
def company_role():
    """
    Expects JSON: { "company": "...", "role": "..." }
    Returns: summary and suggested skills and sample interview questions.
    """
    data = request.get_json() or {}
    company = data.get("company", "").strip()
    role = data.get("role", "").strip()
    if not company or not role:
        return jsonify({"error": "company and role are required"}), 400

    try:
        overview_text = quick_company_overview(company)
    except Exception as e:
        current_app.logger.exception("scrape error")
        overview_text = f"Could not fetch detailed overview: {str(e)}"

    prompt = (
        "You are a recruiter/technical sourcer. Given the company overview below and a job role, "
        "produce a concise company summary (2-4 bullets), a list of role-specific required skills (top 8), "
        "typical years of experience, salary range, business domain, and 5 tailored interview questions for the role. "
        "Also provide 3 recent news headlines about the company.\n\n"
        f"Company Overview:\n{overview_text}\n\nRole: {role}\n\n"
        "Please format as JSON with keys: company_summary, business_domain, latest_news, skills, experience_years, salary_range, interview_questions. "
        "latest_news should be an array of objects with title and summary."
    )

    import json
    try:
        llm_out = generate(prompt)  # Gemini API only
        current_app.logger.info(f"Raw Gemini response: {llm_out}")
        # Strip Markdown code block markers if present
        cleaned = llm_out.strip()
        if cleaned.startswith('```json'):
            cleaned = cleaned[len('```json'):].strip()
        if cleaned.startswith('```'):
            cleaned = cleaned[len('```'):].strip()
        if cleaned.endswith('```'):
            cleaned = cleaned[:-3].strip()
        # Try to parse only the first valid JSON object
        import re
        try:
            # Find the first {...} block
            match = re.search(r'{.*}', cleaned, re.DOTALL)
            if match:
                first_json = match.group(0)
                structured = json.loads(first_json)
            else:
                raise ValueError('No JSON object found')
        except Exception as parse_err:
            current_app.logger.exception("Gemini output not valid JSON")
            structured = {"company_summary": ["Could not parse Gemini output."], "skills": [], "experience_years": "N/A", "interview_questions": []}
    except Exception as e:
        current_app.logger.exception("gemini error")
        # Fallback mock data
        structured = {"company_summary": ["Could not generate summary due to API error."], "skills": [], "experience_years": "N/A", "interview_questions": []}
        llm_out = str(e)
    return jsonify({"results": structured, "overview": overview_text, "raw": llm_out})
