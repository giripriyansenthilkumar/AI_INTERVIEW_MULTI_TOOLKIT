import ctypes

# Monkey-patch ctypes.CDLL to avoid TypeError when name is None
_original_cdll_init = ctypes.CDLL.__init__
def _patched_cdll_init(self, name, *args, **kwargs):
    if name is None:
        raise OSError("Cannot load library: name is None")
    return _original_cdll_init(self, name, *args, **kwargs)
ctypes.CDLL.__init__ = _patched_cdll_init

try:
    import whisper
except OSError as e:
    whisper = None

from config.settings import WHISPER_MODEL

if whisper:
    print("[whisper] Loading Whisper model:", WHISPER_MODEL)
    _model = whisper.load_model(WHISPER_MODEL)
else:
    _model = None

def get_model():
    return _model
    return _model
