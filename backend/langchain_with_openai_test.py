import os
from dotenv import load_dotenv
import getpass
from langchain_openai import OpenAI

# Load .env file if it exists
load_dotenv()

# Ensure API key is available BEFORE using the model
if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter your OpenAI API key: ")

# Initialize the model AFTER setting the API key
llm = OpenAI()

# Test a simple prompt
response = llm.invoke("Hello, how are you?")
print(f"Response 1: {response}")

# Test another question
response2 = llm.invoke("What is 3 + 2?")
print(f"Response 2: {response2}")
