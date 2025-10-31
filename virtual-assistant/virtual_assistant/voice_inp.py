import sounddevice as sd
from scipy.io.wavfile import write
import numpy as np
import whisper

def voice_speak():
    SAMPLE_RATE = 16000   # samples per second
    DURATION = 5           # seconds to record

    print("Recording...")
    audio = sd.rec(int(DURATION * SAMPLE_RATE), samplerate=SAMPLE_RATE, channels=1, dtype='float32')
    sd.wait()  # Wait until recording is finished
    print("Recording finished!")

    # Save to file
    write("output.wav", SAMPLE_RATE, (audio * 32767).astype(np.int16))

    model = whisper.load_model("tiny")

    result = model.transcribe("output.wav", fp16=False)
    print(result["text"])
    return result["text"]