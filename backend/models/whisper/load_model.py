import whisper
from config.settings import WHISPER_MODEL

print("[whisper] Loading Whisper model:", WHISPER_MODEL)
_model = whisper.load_model(WHISPER_MODEL)

def get_model():
    return _model
