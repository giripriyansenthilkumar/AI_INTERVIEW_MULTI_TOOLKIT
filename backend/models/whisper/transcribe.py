from .load_model import get_model
import os
from pydub import AudioSegment
import tempfile

model = get_model()

def _convert_to_wav(input_path: str) -> str:
    """
    Ensure audio is WAV 16-bit PCM at 16k/24k/48k sample rates supported by whisper.
    Returns path to temporary WAV file.
    """
    sound = AudioSegment.from_file(input_path)
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
    wav_path = tmp.name
    sound.export(wav_path, format="wav")
    tmp.close()
    return wav_path

def transcribe_file(file_path: str, language: str = "en"):
    """
    Transcribe audio file using Whisper model instance.
    """
    wav_path = file_path
    try:
        # convert if not wav
        if not file_path.lower().endswith(".wav"):
            wav_path = _convert_to_wav(file_path)
        result = model.transcribe(wav_path, language=language)
        text = result.get("text", "").strip()
        return {"text": text, "raw": result}
    finally:
        if wav_path != file_path and os.path.exists(wav_path):
            try:
                os.remove(wav_path)
            except:
                pass
