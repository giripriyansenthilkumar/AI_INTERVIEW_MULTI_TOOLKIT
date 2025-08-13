import os
import google.generativeai as genai

# Load API key from env
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("GEMINI_API_KEY not found. Please set it as an environment variable.")

genai.configure(api_key=API_KEY)

# Use flash for speed & free quota
model = genai.GenerativeModel("gemini-1.5-flash")

def generate_response(prompt):
    response = model.generate_content(prompt)
    return response.text
