import subprocess as sp
import sys 
import requests
from . import llm_manager
from . import tts_init
from .tts_init import vs_speak
from decouple import config

WATER_API = config('WATER_API_KEY')

#open camera behaviors
def open_camera():
    script = 'esp32_connector/esp32_connector.py' #Connect to ESP32 camera
    sp.run([sys.executable, str(script)], check=True)

def water_report():
    water_data_API = WATER_API
    response = requests.get(water_data_API)
    vs_speak(llm_manager.ollama_init(f"Make a report about water condition base on this {response.text} JSON file, then give me any advice if you have, super short answer, speak like human"))