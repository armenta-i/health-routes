import os
from dotenv import load_dotenv
import getpass
from langchain_openai import OpenAI

# load the environmental vars
load_dotenv()
# ensure the API key is set
if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter your OpenAI API key: ")
# initialize the chat model
llm = OpenAI()
# create a template for the prompt
response = llm.invoke( f"""
    You are a healthcare assistant that helps users find nearby healthcare providers based on their symptoms and language needs.
    Given:
    - User's full Location: {address}
    - Symptoms or Issues: {health_problems}
    - Preferred Language: {language}
    You must:
    1. Analyze and determine a condition the user may be suffering from.
    2. Determine who should the user see (the doctor specialty)
    3. Remedies that the user can do.
    4. If symptoms are severe (e.g., chest pain, breathing problems), prioritize Emergency Rooms first.
    5. (Optional) Add a short sentence encouraging the user to seek help immediately if the symptoms are serious.
    Formatting:
    Respond in the language that matches the user's request (English or Spanish).
    Be helpful, reassuring, and professional.""")