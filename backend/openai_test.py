import openai
import os
from dotenv import load_dotenv

# Load variables from .env
load_dotenv()

# Get API key from environment (without hardcoding it)
api_key = os.getenv("OPENAI_API_KEY")

# Raise an error if the key is missing (optional but recommended)
if not api_key:
    raise ValueError("Missing OpenAI API key! Please set OPENAI_API_KEY in your environment.")

# Create OpenAI client
client = openai.OpenAI(api_key=api_key)

# Initial system prompt
messages = [{"role": "system", "content": "You are an intelligent assistant."}]

# User message
message = "What is 3 + 2"
if message:
    messages.append({"role": "user", "content": message})

    # Make API call
    chat = client.chat.completions.create(
        model="gpt-4o",
        messages=messages
    )

    # Extract the AI reply
    reply = chat.choices[0].message.content
    print(f"ChatGPT: {reply}")

    # Update messages with assistant's reply (optional if you want multi-turn conversation)
    messages.append({"role": "assistant", "content": reply})
