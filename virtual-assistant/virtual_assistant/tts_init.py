from kokoro import KPipeline
import sounddevice as sd
import numpy as np

kokoro_pipeline = KPipeline(lang_code="a")  # Setting language lang_code = "a" which means English

def vs_speak(text, kokoro_pipeline=kokoro_pipeline, voice_preset="af_heart", batch_size = 2):
    if not text:
        print("Empty text provided")
        return
    
    batched = [text[i:i + batch_size] for i in range(0,len(text), batch_size)]

    generator = kokoro_pipeline(text, voice=voice_preset)
    audio = np.concatenate(
        [audio for gs, ps, audio in generator], axis=0
        )
    sd.play(audio, samplerate=24000)
    sd.wait()  