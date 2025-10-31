import pvporcupine
from decouple import config 
import pyaudio
import struct

ACCESS_KEY = config('PVPORCUPINE_KEY')
KEYWORD_FILE_PATH = config('KW_PATH')
hotword_detector = pvporcupine.create(
    access_key= ACCESS_KEY,
    keyword_paths=[KEYWORD_FILE_PATH]
)
def wakeup_check():
    return True

def wakeup():
    try:
        pa = pyaudio.PyAudio()

        audio_stream = pa.open(
            rate=hotword_detector.sample_rate,
            channels=1,
            format=pyaudio.paInt16,
            input=True,
            frames_per_buffer=hotword_detector.frame_length
        )

        while True:
            pcm = audio_stream.read(hotword_detector.frame_length)
            pcm = struct.unpack_from("h" * hotword_detector.frame_length, pcm)

            keyword_index = hotword_detector.process(pcm)

            if keyword_index >= 0:
                print("Hotword detected")
                wakeup_check()
                break
    except Exception as e:
        print(f"Error: {e}")  