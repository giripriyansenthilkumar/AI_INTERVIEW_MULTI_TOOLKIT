import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from routes.interview import interview_bp
from routes.resume import resume_bp
from routes.research import research_bp
from config.settings import UPLOAD_DIR, OUTPUT_DIR
from routes.gemini import gemini_bp

app = Flask(__name__, static_folder="../frontend", template_folder="../frontend")
CORS(app)

app.register_blueprint(gemini_bp, url_prefix="/api/gemini")

# ensure dirs exist
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)


# register blueprints for all frontend features
app.register_blueprint(interview_bp, url_prefix="/api/interview")
app.register_blueprint(resume_bp, url_prefix="/api/resume")
app.register_blueprint(research_bp, url_prefix="/api/research")

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def frontend(path):
    # serve frontend files (assumes frontend files are one level above backend)
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=7860, debug=True)
