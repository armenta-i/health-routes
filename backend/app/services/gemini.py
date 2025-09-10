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

    print("API Key configured")
    prompt = f"""
    You are an emergency-aware healthcare assistant providing critical medical guidance based on symptoms severity.
    
    CRITICAL TASK: Analyze these symptoms and provide life-saving advice if needed.
    
    Patient Information:
    - Current Location: {address}
    - Reported Symptoms: {health_problems}
    - Language Preference: {language}
    
    IMPORTANT: First determine if this is potentially life-threatening. If ANY of these conditions are possible based on the symptoms (chest pain, difficulty breathing, severe bleeding, stroke symptoms, loss of consciousness, severe allergic reaction, severe burns, poisoning, severe head injury), START your response with the emergency section.
    
    FOR LIFE-THREATENING CONDITIONS, use this format:

    **⚠️ EMERGENCY MEDICAL ATTENTION REQUIRED ⚠️**
    **WARNING:** Call emergency services (911 or local emergency number) IMMEDIATELY
    
    **Critical Condition Suspected:**
    [Explain what life-threatening condition this might be]
    
    **IMMEDIATE ACTIONS While Waiting for Emergency Services:**
    * [Specific action 1 - e.g., "If conscious, help them sit upright"]
    * [Specific action 2 - e.g., "Loosen tight clothing around chest/neck"]
    * [Specific action 3 - e.g., "Monitor breathing and consciousness"]
    * [Include CPR instructions if relevant]
    
    **DO NOT:**
    * [Thing to avoid that could worsen condition]
    * [Another dangerous action to avoid]
    
    **Expected Emergency Response Time:**
    [Typical ambulance arrival time for their area if known]
    
    FOR NON-EMERGENCY CONDITIONS, use this format:

    **1. Medical Assessment:**
    [Provide detailed analysis of what condition this likely is, with confidence level]
    [Explain why you believe it's this condition based on symptoms]
    
    **2. Severity Level:**
    [Rate as: Mild | Moderate | Serious but not emergency]
    [Explain typical progression if untreated]
    
    **3. Recommended Healthcare Provider:**
    [Be specific: "Visit urgent care within 24 hours" or "Schedule appointment with primary care doctor within 3-5 days"]
    [Suggest specific type of specialist if needed]
    
    **4. Immediate Relief Measures:**
    * [Specific remedy with dosage/frequency - e.g., "Take 400-600mg ibuprofen every 6 hours"]
    * [Physical relief method - e.g., "Apply ice pack for 15 minutes every hour"]
    * [Comfort measure - e.g., "Rest in dark, quiet room"]
    * [Dietary advice - e.g., "Drink 8-10 glasses of water throughout the day"]
    
    **5. Home Care Instructions:**
    * [Day 1 care routine]
    * [Day 2-3 progression]
    * [When to expect improvement]
    
    **6. Red Flags - Seek Immediate Care If:**
    **WARNING:** Go to emergency room if you experience:
    * [Specific dangerous symptom to watch for]
    * [Another warning sign]
    * [Progressive worsening indicator]
    
    **7. Recovery Timeline:**
    [Expected duration and stages of recovery]
    
    **8. Prevention Tips:**
    * [How to prevent recurrence]
    * [Lifestyle modifications]
    
    FORMATTING RULES FOR PROPER DISPLAY:
    - Use **text** for bold headers and important labels
    - Start each section header with ** and end with **
    - Use * at the beginning of bullet points (single asterisk, space, then text)
    - For warnings/emergencies, always include "WARNING:" or "EMERGENCY" in the text
    - Keep line breaks between sections for proper spacing
    - Write clear, direct sentences that a worried patient can easily understand
    - Respond in {language} language
    - Be compassionate but urgent when necessary
    - Use medical terms but always explain them in simple language
    
    Remember: You might save a life with clear, urgent instructions for emergencies, or provide comfort and healing guidance for common ailments. Analyze carefully and respond appropriately to the severity level.
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
        **System Alert**
        
        I apologize, but I'm unable to process your medical request at the moment due to a technical issue.
        
        **Your Reported Symptoms:** {health_problems}
        
        **IMPORTANT:** 
        * If you're experiencing severe symptoms, please don't wait
        * Call emergency services (911) immediately for:
        * Chest pain or pressure
        * Difficulty breathing
        * Severe bleeding
        * Loss of consciousness
        * Severe allergic reactions
        
        **For Non-Emergency Symptoms:**
        * Contact your healthcare provider
        * Visit an urgent care center
        * Call a medical helpline for guidance
        
        Technical error details: {str(e)}
        """
        
        print("INFO: Returning fallback response")
        return fallback_response

# Alternative async version if you prefer async/await pattern
async def get_medical_advice_async(address: str, health_problems: str, language: str) -> str:
    """
    Async version of get_medical_advice using Google Gemini API
    """
    
    prompt = f"""
    You are an emergency-aware healthcare assistant providing critical medical guidance based on symptoms severity.
    
    CRITICAL TASK: Analyze these symptoms and provide life-saving advice if needed.
    
    Patient Information:
    - Current Location: {address}
    - Reported Symptoms: {health_problems}
    - Language Preference: {language}
    
    IMPORTANT: First determine if this is potentially life-threatening. If ANY of these conditions are possible based on the symptoms (chest pain, difficulty breathing, severe bleeding, stroke symptoms, loss of consciousness, severe allergic reaction, severe burns, poisoning, severe head injury), START your response with the emergency section.
    
    FOR LIFE-THREATENING CONDITIONS, use this format:

    **⚠️ EMERGENCY MEDICAL ATTENTION REQUIRED ⚠️**
    **WARNING:** Call emergency services (911 or local emergency number) IMMEDIATELY
    
    **Critical Condition Suspected:**
    [Explain what life-threatening condition this might be]
    
    **IMMEDIATE ACTIONS While Waiting for Emergency Services:**
    * [Specific action 1 - e.g., "If conscious, help them sit upright"]
    * [Specific action 2 - e.g., "Loosen tight clothing around chest/neck"]
    * [Specific action 3 - e.g., "Monitor breathing and consciousness"]
    * [Include CPR instructions if relevant]
    
    **DO NOT:**
    * [Thing to avoid that could worsen condition]
    * [Another dangerous action to avoid]
    
    **Expected Emergency Response Time:**
    [Typical ambulance arrival time for their area if known]
    
    FOR NON-EMERGENCY CONDITIONS, use this format:

    **1. Medical Assessment:**
    [Provide detailed analysis of what condition this likely is, with confidence level]
    [Explain why you believe it's this condition based on symptoms]
    
    **2. Severity Level:**
    [Rate as: Mild | Moderate | Serious but not emergency]
    [Explain typical progression if untreated]
    
    **3. Recommended Healthcare Provider:**
    [Be specific: "Visit urgent care within 24 hours" or "Schedule appointment with primary care doctor within 3-5 days"]
    [Suggest specific type of specialist if needed]
    
    **4. Immediate Relief Measures:**
    * [Specific remedy with dosage/frequency - e.g., "Take 400-600mg ibuprofen every 6 hours"]
    * [Physical relief method - e.g., "Apply ice pack for 15 minutes every hour"]
    * [Comfort measure - e.g., "Rest in dark, quiet room"]
    * [Dietary advice - e.g., "Drink 8-10 glasses of water throughout the day"]
    
    **5. Home Care Instructions:**
    * [Day 1 care routine]
    * [Day 2-3 progression]
    * [When to expect improvement]
    
    **6. Red Flags - Seek Immediate Care If:**
    **WARNING:** Go to emergency room if you experience:
    * [Specific dangerous symptom to watch for]
    * [Another warning sign]
    * [Progressive worsening indicator]
    
    **7. Recovery Timeline:**
    [Expected duration and stages of recovery]
    
    **8. Prevention Tips:**
    * [How to prevent recurrence]
    * [Lifestyle modifications]
    
    FORMATTING RULES FOR PROPER DISPLAY:
    - Use **text** for bold headers and important labels
    - Start each section header with ** and end with **
    - Use * at the beginning of bullet points (single asterisk, space, then text)
    - For warnings/emergencies, always include "WARNING:" or "EMERGENCY" in the text
    - Keep line breaks between sections for proper spacing
    - Write clear, direct sentences that a worried patient can easily understand
    - Respond in {language} language
    - Be compassionate but urgent when necessary
    - Use medical terms but always explain them in simple language
    
    Remember: You might save a life with clear, urgent instructions for emergencies, or provide comfort and healing guidance for common ailments. Analyze carefully and respond appropriately to the severity level.
    """
    
    try:
        # Generate content using Gemini (async)
        response = await model.generate_content_async(prompt)
        return response.text
        
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        # Fallback response
        return f"""
        **System Alert**
        
        I apologize, but I'm unable to process your medical request at the moment.
        
        **Your Reported Symptoms:** {health_problems}
        
        **WARNING:** If experiencing severe symptoms:
        * Call emergency services (911) immediately
        * Don't wait for online assistance
        * Seek immediate medical attention
        
        For non-emergency symptoms, please contact your healthcare provider or visit an urgent care center.
        """