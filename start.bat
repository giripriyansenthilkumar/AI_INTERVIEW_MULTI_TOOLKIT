@echo off
REM Check if venv exists, create if not
if not exist backend\venv (
    echo Creating Python virtual environment...
    cd backend
    python -m venv venv
    cd ..
)

REM Activate venv
call backend\venv\Scripts\activate.bat

REM Install requirements
pip install -r backend\requirements.txt

REM Set Gemini API key (replace YOUR_GEMINI_API_KEY with your actual key)
set GEMINI_API_KEY=AIzaSyAnPM4hQ-VxA113TtKcjLUOYJL-bskc3bA

REM Run Flask app
cd backend
python app.py

pause
