# AI Mock Interview Multi Toolkit

This project is an AI-powered career toolkit web application with three main features:
- **Mock Interview**: Practice interviews with dynamic questions and honest feedback powered by Gemini.
- **Resume Optimizer**: Upload your resume, get AI-powered optimization suggestions, and download improved resumes.
- **Research Agent**: Get structured company and role research (skills, news, business domain, salary) using Gemini.

## Features

### 1. Mock Interview
- Dynamic interview questions and feedback using Gemini API.
- Audio transcription via Whisper.
- Honest interview summaries and feedback.

### 2. Resume Optimizer
- Upload resumes in PDF or DOCX format.
- Resume content is transcribed and sent to Gemini for optimization.
- Download optimized resume as TXT file.
- Fallback to mock data if Gemini quota is exceeded.

### 3. Research Agent
- Enter company and job role to get structured research results.
- Results include company, skills, news, business domain, and salary.
- Powered by Gemini API, with robust JSON parsing and fallback.

## Project Structure

```
requirements.txt
Structure.txt
backend/
    app.py
    config/
        settings.py
    models/
        llama/
            generate.py
            load_model.py
        whisper/
            load_model.py
            transcribe.py
    outputs/
        reports/
        resumes/
    routes/
        interview.py
        research.py
        resume.py
    uploads/
        audio/
        resumes/
    utils/
        keyword_matcher.py
        pdf_parser.py
        web_scraper.py
frontend/
    app.js
    index.html
    style.css
```

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js (optional, for static server)

### Setup (Windows)
1. Double-click `start.bat` or run in terminal:
    ```bat
    start.bat
    ```
    - Creates/activates Python virtual environment
    - Installs dependencies from `requirements.txt`
    - Prompts to set your Gemini API key
    - Starts backend Flask server

### Setup (Unix/macOS)
1. Run in terminal:
    ```sh
    bash start.sh
    ```
    - Creates/activates Python virtual environment
    - Installs dependencies from `requirements.txt`
    - Prompts to set your Gemini API key
    - Starts backend Flask server

### Frontend
- Open `frontend/index.html` in your browser.
- (Optional) Serve with a static server:
    ```sh
    npx http-server frontend
    ```

## Configuration
- Set your Gemini API key in the environment variable `GEMINI_API_KEY`.
- Backend settings can be adjusted in `backend/config/settings.py`.

## API Endpoints
- `/api/interview/start_interview` - Start interview session
- `/api/interview/submit_answer` - Submit interview answer
- `/api/interview/end_interview` - End interview session
- `/api/resume/upload_resume` - Upload resume
- `/api/resume/optimize` - Optimize resume
- `/api/research/company_role` - Research company and role

## Development
- Backend: Flask, Gemini API, Whisper
- Frontend: Vanilla JS, HTML, CSS
- All interview, resume, and research logic uses Gemini (not LLaMA)
- Robust fallback to mock data if Gemini fails

## Troubleshooting
- If you see errors about missing dependencies, ensure your virtual environment is activated and run:
    ```sh
    pip install -r backend/requirements.txt
    ```
- If Gemini API quota is exceeded, the app will fallback to mock data.
- For frontend issues, check browser console for errors.

## License
MIT License

## Credits
- Gemini API by Google
- Whisper by OpenAI
- Project maintained by your team
