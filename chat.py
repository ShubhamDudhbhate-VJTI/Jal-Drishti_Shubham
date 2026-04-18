#!/usr/bin/env python3
import requests
import json

def chat_with_ai(message):
    """Chat with Ollama AI about anything!"""
    url = "http://localhost:11434/api/generate"
    
    payload = {
        "model": "llama3.2:1b",
        "prompt": message,
        "stream": False
    }
    
    try:
        response = requests.post(url, json=payload, timeout=60)
        if response.status_code == 200:
            data = response.json()
            return data.get("response", "No response")
        else:
            return f"Error: {response.status_code}"
    except Exception as e:
        return f"Error: {str(e)}"

if __name__ == "__main__":
    print("=== Ollama AI Chat ===")
    print("You can ask me ANYTHING!")
    print("Type 'quit' to exit\n")
    
    while True:
        user_input = input("You: ")
        if user_input.lower() == 'quit':
            break
            
        response = chat_with_ai(user_input)
        print(f"AI: {response}\n")
