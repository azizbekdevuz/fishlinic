import pvcobra
from decouple import config 
import pyaudio
import numpy as np 

ACCESS_KEY = config('PVPORCUPINE_KEY')

#Setting ACCESS_KEY to pvcobra
handle = pvcobra.create(access_key= ACCESS_KEY)

FORMAT = pyaudio.paInt16
CHANNELS = 1 
RATE = 16000
FRAMES_PER_BUFFER = 512

audio = pyaudio.PyAudio()

stream = audio.open(format=FORMAT,
                    channels=CHANNELS,
                    rate=RATE,
                    input=True,
                    frames_per_buffer=FRAMES_PER_BUFFER)

def get_next_audio_frame():
    audio_data = stream.read(FRAMES_PER_BUFFER, exception_on_overflow=False)
    audio_frame = np.frombuffer(audio_data, dtype=np.int16)
    return audio_frame

def voice_activity_prob():
    try:
        while True:
            audio_frame = get_next_audio_frame()
            voice_probability = handle.process(audio_frame) * 100
            print(f"Voice Probability: {voice_probability: .2f}")
            return voice_probability
    except KeyboardInterrupt:
        print("Stopping Cobra")

#Reset voice activity function
def reset_cobra_state(handle=handle, num_frames=20):
    silent_frame = np.zeros(handle.frame_length, dtype=np.int16)
    for _ in range(num_frames):
        handle.process(silent_frame)