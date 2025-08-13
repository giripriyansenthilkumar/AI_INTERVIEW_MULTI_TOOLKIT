#!/bin/bash
# Check if venv exists, create if not
if [ ! -d "backend/venv" ]; then
    echo "Creating Python virtual environment..."
    cd backend
    python3 -m venv venv
    cd ..
fi

# Activate venv
source backend/venv/bin/activate

# Install requirements
pip install -r backend/requirements.txt

# Set Gemini API key (replace YOUR_GEMINI_API_KEY with your actual key)
export GEMINI_API_KEY=AIzaSyAnPM4hQ-VxA113TtKcjLUOYJL-bskc3bA

# Run Flask app
cd backend
python app.py
