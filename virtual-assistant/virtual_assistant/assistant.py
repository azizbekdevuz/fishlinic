from datetime import datetime
from .utils import opening_text
import random as rand
import speech_recognition as sr
from .tts_init import vs_speak
import time
from .wake_up_init import wakeup, wakeup_check
import speech_recognition as sr
from datetime import datetime
from playaudio import playaudio
from .behaviors import open_camera, water_report
from .voice_activity import voice_activity_prob, reset_cobra_state  
from .llm_manager import ollama_init 
from .voice_inp import voice_speak

#Give a random choice of response 
def pick_choice(): 
    random_number = rand.randint(0,3)
    print(f"Random choice : {opening_text[random_number]}")
    vs_speak(opening_text[random_number])

def user_input(language="en-US"):
    try:
        playaudio("audio/ping.mp3")
        query = voice_speak()
        print(f"Your input: {query}")

        exit_words = ("exit", "stop", "bye", "goodbye", "quit")
        if not any(w in query for w in exit_words):
            pass
        else:
            hour = datetime.now().hour
            if hour >= 21 or hour < 6:     
                vs_speak("Good night! Take care.")
            else:
                vs_speak("Goodbye sir! Have a good day!")
            raise SystemExit 

        return query

    except sr.WaitTimeoutError:
        vs_speak("I didn't hear anything. Please try again.")
        return ""
    except sr.UnknownValueError:
        vs_speak("Sorry sir! Please say again.")
        return ""
    except sr.RequestError as e:
        vs_speak(f"Recognition service error. Please try again later.")
        return ""

#Greeting protocols 
def greeting():
    hour = datetime.now().hour
    if hour > 0 and hour < 12:
        vs_speak("Good morning. My name is Veronica, how can I help you ?")
    elif hour >= 12 and hour < 18:
        vs_speak("Good afternoon. My name is Veronica, how can I help you ?")
    elif hour >= 18 and hour < 24: 
        vs_speak("Good evening. My name is Veronica, how can I help you ?")

if __name__ == "__main__":
    wakeup()
    if wakeup_check():
        time.sleep(1)
        vs_speak("Veronica initiated ! Please wait!")
        # vs_speak("Please stand by !")
        # playaudio("audio/init.mp3")
        time.sleep(1)
        greeting()
        while True:
            if voice_activity_prob() > 90:
                q = user_input().lower()
                if 'open camera' in q:
                    vs_speak("Camera is opened now")
                    pick_choice()
                    open_camera()
                    vs_speak("Camera has been closed")
                elif 'water report' in q:
                    vs_speak("Water report is being generated")
                    pick_choice()
                    water_report()
                    vs_speak("Water report has been generated")
                elif q != "":
                    vs_speak(ollama_init(q))
                    reset_cobra_state()