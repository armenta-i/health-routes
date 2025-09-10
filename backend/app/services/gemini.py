import os
import google.generativeai as genai
from app.core.config import GEMINI_API_KEY

# Configure the Gemini API
genai.configure(api_key=GEMINI_API_KEY)

# Initialize the Gemini model
model = genai.GenerativeModel('gemini-1.5-flash') 

def get_medical_advice(address: str, health_problems: str, language: str) -> str:
    """
    Get medical advice using Google Gemini API
    
    Args:
        address (str): User's full location
        health_problems (str): User's symptoms or health issues
        language (str): User's preferred language
        
    Returns:
        str: Medical advice response from Gemini
    """
    
    print("=== GEMINI SERVICE CALLED ===")
    print(f"Address: '{address}'")
    print(f"Health problems: '{health_problems}'")
    print(f"Language: '{language}'")
    
    # Check if API key is configured
    if not GEMINI_API_KEY:
        print("ERROR: GEMINI_API_KEY is not set!")
        raise Exception("Gemini API key not configured")
    
    print(f"API Key configured: {GEMINI_API_KEY[:10]}...{GEMINI_API_KEY[-5:] if len(GEMINI_API_KEY) > 15 else 'SHORT'}")
    
    prompt = f"""
    You are a healthcare assistant that helps users find nearby healthcare providers based on their symptoms and language needs.
    
    Given:
    - User's full Location: {address}
    - Symptoms or Issues: {health_problems}
    - Preferred Language: {language}
    
    Please provide your response using this EXACT format:

    **1. Possible Condition:**
    [Describe the likely condition based on symptoms]

    **2. Recommended Healthcare Provider:**
    [Specify what type of doctor or healthcare facility to visit]

    **3. Home Remedies & Self-Care:**
    [List practical home remedies and self-care measures]

    **4. When to Seek Immediate Care:**
    **WARNING:** [List specific warning signs that require emergency care, starting each with "WARNING:"]

    **5. Next Steps:**
    [Provide clear next steps for the user]

    Important formatting rules:
    - Start any emergency/warning text with "**WARNING:**" to ensure it appears in red
    - Use bullet points (*) for lists 
    - Keep sections concise but informative
    - Respond in the language that matches the user's request ({language})
    - Be professional and reassuring
    """
    
    print(f"Prompt length: {len(prompt)} characters")
    print(f"First 100 chars of prompt: {prompt[:100]}...")
    
    try:
        print("INFO: Configuring Gemini...")
        genai.configure(api_key=GEMINI_API_KEY)
        print("SUCCESS: Gemini configured successfully")
        
        print("INFO: Initializing Gemini model...")
        model = genai.GenerativeModel('gemini-1.5-flash')
        print("SUCCESS: Gemini model initialized")
        
        print("INFO: Generating content...")
        response = model.generate_content(prompt)
        print("SUCCESS: Content generation completed")
        
        print(f"Response type: {type(response)}")
        print(f"Response attributes: {dir(response)}")
        
        if hasattr(response, 'text'):
            response_text = response.text
            print(f"Response text length: {len(response_text)} characters")
            print(f"First 200 chars: {response_text[:200]}...")
            return response_text
        else:
            print("ERROR: Response has no 'text' attribute")
            print(f"Response content: {response}")
            raise Exception("Invalid response format from Gemini API")
        
    except Exception as e:
        print(f"GEMINI ERROR: {str(e)}")
        print(f"Error type: {type(e)}")
        
        # Try to get more details about the error
        if hasattr(e, 'args'):
            print(f"Error args: {e.args}")
        if hasattr(e, 'code'):
            print(f"Error code: {e.code}")
        if hasattr(e, 'details'):
            print(f"Error details: {e.details}")
            
        import traceback
        print("Full traceback:")
        traceback.print_exc()
        
        # Fallback response
        fallback_response = f"""
        I apologize, but I'm unable to process your request at the moment due to a technical issue.
        
        Technical error: {str(e)}
        
        Please consult with a healthcare professional about your symptoms: {health_problems}.
        
        If you're experiencing severe symptoms like chest pain, difficulty breathing, 
        or loss of consciousness, please seek emergency medical attention immediately.
        """
        
        print("INFO: Returning fallback response")
        return fallback_response

# Alternative async version if you prefer async/await pattern
async def get_medical_advice_async(address: str, health_problems: str, language: str) -> str:
    """
    Async version of get_medical_advice using Google Gemini API
    """
    
    prompt = f"""
    You are a healthcare assistant that helps users find nearby healthcare providers based on their symptoms and language needs.
    
    Given:
    - User's full Location: {address}
    - Symptoms or Issues: {health_problems}
    - Preferred Language: {language}
    
    Please provide your response using this EXACT format:

    **1. Possible Condition:**
    [Describe the likely condition based on symptoms]

    **2. Recommended Healthcare Provider:**
    [Specify what type of doctor or healthcare facility to visit]

    **3. Home Remedies & Self-Care:**
    [List practical home remedies and self-care measures]

    **4. When to Seek Immediate Care:**
    **WARNING:** [List specific warning signs that require emergency care, starting each with "WARNING:"]

    **5. Next Steps:**
    [Provide clear next steps for the user]

    Important formatting rules:
    - Start any emergency/warning text with "**WARNING:**" to ensure it appears in red
    - Use bullet points (*) for lists 
    - Keep sections concise but informative
    - Respond in the language that matches the user's request ({language})
    - Be professional and reassuring
    """
    
    try:
        # Generate content using Gemini (async)
        response = await model.generate_content_async(prompt)
        return response.text
        
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        # Fallback response
        return f"""
        I apologize, but I'm unable to process your request at the moment. 
        Please consult with a healthcare professional about your symptoms: {health_problems}.
        
        If you're experiencing severe symptoms like chest pain, difficulty breathing, 
        or loss of consciousness, please seek emergency medical attention immediately.
        """