from ollama import chat 
from ollama import ChatResponse

MODEL_ID = "qwen2.5:3b" #Use the model id that you are pulling from ollama

def ollama_init(prompt):
    try:
        response: ChatResponse = chat(model=MODEL_ID, messages=[
            {
                'role':'system',
                'content':'You are veronica, an AI assistant for smart aquarium. Only short answer. Only English'
            },
            {
                'role':'user',
                'content': prompt
            }
        ])
        return response['message']['content']
    except Exception as e:
        return "Check Ollama server and connection"