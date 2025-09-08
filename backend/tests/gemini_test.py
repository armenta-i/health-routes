import sys
import os

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.gemini import get_medical_advice

def test_gemini_api():
    """Simple test for Gemini API"""
    
    print("Testing Gemini API...")
    
    # Test 1: Basic English test
    print("\n--- Test 1: Basic English ---")
    try:
        response = get_medical_advice(
            address="Austin, TX",
            health_problems="headache and fever",
            language="English"
        )
        print(f"Success!")
        print(f"Response: {response}")
        
    except Exception as e:
        print(f"Failed: {e}")
    
    # Test 2: Spanish test
    print("\n--- Test 2: Spanish ---")
    try:
        response = get_medical_advice(
            address="Miami, FL", 
            health_problems="dolor de cabeza",
            language="Spanish"
        )
        print(f"Success!")
        print(f"Response: {response}")
        
    except Exception as e:
        print(f"Failed: {e}")
    
    # Test 3: Emergency symptoms
    print("\n--- Test 3: Emergency Symptoms ---")
    try:
        response = get_medical_advice(
            address="New York, NY",
            health_problems="chest pain and difficulty breathing", 
            language="English"
        )
        print(f"Success!")
        print(f"Response: {response}")
        
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    test_gemini_api()
    print("\nTest completed!")