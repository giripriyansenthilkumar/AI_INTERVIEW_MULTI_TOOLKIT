import whisper
model = whisper.load_model("base")  # will download if not present
import whisper

print("Downloading Whisper base model...")
model = whisper.load_model("base")
print("Model downloaded!")
