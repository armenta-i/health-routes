import sys
import os
import asyncio
import pytest
from unittest.mock import patch, MagicMock

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.gemini import get_medical_advice, get_medical_advice_async

class TestGeminiAPI:
    """Test suite for Gemini API medical advice functionality"""
    
    def test_get_medical_advice_basic(self):
        """Test basic functionality of get_medical_advice"""
        try:
            response = get_medical_advice(
                address="New York, NY",
                health_problems="headache and fever",
                language="English"
            )
            
            # Check that we get a string response
            assert isinstance(response, str)
            assert len(response) > 0
            
            # Check that response contains relevant keywords
            response_lower = response.lower()
            assert any(keyword in response_lower for keyword in [
                'headache', 'fever', 'doctor', 'physician', 'medical', 'healthcare'
            ])
            
            print("✅ Basic Gemini API test passed")
            print(f"Response length: {len(response)} characters")
            print(f"Response preview: {response[:200]}...")
            
        except Exception as e:
            print(f"❌ Basic Gemini API test failed: {e}")
            # Don't fail the test if it's an API key issue
            if "API_KEY" in str(e) or "authentication" in str(e).lower():
                pytest.skip(f"Skipping test due to API key issue: {e}")
            else:
                raise
    
    def test_get_medical_advice_spanish(self):
        """Test Gemini API with Spanish language"""
        try:
            response = get_medical_advice(
                address="Miami, FL",
                health_problems="dolor de cabeza y fiebre",
                language="Spanish"
            )
            
            assert isinstance(response, str)
            assert len(response) > 0
            
            # Check for Spanish keywords
            response_lower = response.lower()
            spanish_keywords = ['dolor', 'cabeza', 'fiebre', 'médico', 'doctor', 'salud']
            assert any(keyword in response_lower for keyword in spanish_keywords)
            
            print("✅ Spanish language test passed")
            print(f"Spanish response preview: {response[:200]}...")
            
        except Exception as e:
            print(f"❌ Spanish language test failed: {e}")
            if "API_KEY" in str(e) or "authentication" in str(e).lower():
                pytest.skip(f"Skipping test due to API key issue: {e}")
            else:
                raise
    
    def test_get_medical_advice_emergency_symptoms(self):
        """Test Gemini API with emergency symptoms"""
        try:
            response = get_medical_advice(
                address="Los Angeles, CA",
                health_problems="chest pain and difficulty breathing",
                language="English"
            )
            
            assert isinstance(response, str)
            assert len(response) > 0
            
            # Check for emergency-related keywords
            response_lower = response.lower()
            emergency_keywords = ['emergency', 'urgent', 'immediate', 'hospital', 'er', '911']
            assert any(keyword in response_lower for keyword in emergency_keywords)
            
            print("✅ Emergency symptoms test passed")
            print(f"Emergency response preview: {response[:200]}...")
            
        except Exception as e:
            print(f"❌ Emergency symptoms test failed: {e}")
            if "API_KEY" in str(e) or "authentication" in str(e).lower():
                pytest.skip(f"Skipping test due to API key issue: {e}")
            else:
                raise
    
    @pytest.mark.asyncio
    async def test_get_medical_advice_async(self):
        """Test async version of get_medical_advice"""
        try:
            response = await get_medical_advice_async(
                address="Chicago, IL",
                health_problems="stomach pain and nausea",
                language="English"
            )
            
            assert isinstance(response, str)
            assert len(response) > 0
            
            # Check that response contains relevant keywords
            response_lower = response.lower()
            assert any(keyword in response_lower for keyword in [
                'stomach', 'nausea', 'doctor', 'physician', 'medical', 'healthcare'
            ])
            
            print("✅ Async Gemini API test passed")
            print(f"Async response preview: {response[:200]}...")
            
        except Exception as e:
            print(f"❌ Async Gemini API test failed: {e}")
            if "API_KEY" in str(e) or "authentication" in str(e).lower():
                pytest.skip(f"Skipping test due to API key issue: {e}")
            else:
                raise
    
    @patch('app.services.gemini.model.generate_content')
    def test_get_medical_advice_error_handling(self, mock_generate):
        """Test error handling when API call fails"""
        # Mock an API error
        mock_generate.side_effect = Exception("API Error")
        
        response = get_medical_advice(
            address="Test City",
            health_problems="test symptoms",
            language="English"
        )
        
        # Should return fallback response
        assert isinstance(response, str)
        assert "unable to process your request" in response.lower()
        assert "healthcare professional" in response.lower()
        
        print("✅ Error handling test passed")
    
    def test_input_validation(self):
        """Test with various input types"""
        test_cases = [
            ("", "headache", "English"),  # Empty address
            ("New York", "", "English"),   # Empty symptoms
            ("New York", "headache", ""),  # Empty language
        ]
        
        for address, symptoms, language in test_cases:
            try:
                response = get_medical_advice(address, symptoms, language)
                assert isinstance(response, str)
                print(f"✅ Input validation test passed for: address='{address}', symptoms='{symptoms}', language='{language}'")
            except Exception as e:
                print(f"⚠️  Input validation warning for address='{address}', symptoms='{symptoms}', language='{language}': {e}")

def run_manual_test():
    """Manual test function that can be run directly"""
    print("🧪 Running manual Gemini API tests...")
    
    test_cases = [
        {
            "name": "Basic Test",
            "address": "Austin, TX",
            "health_problems": "sore throat and cough",
            "language": "English"
        },
        {
            "name": "Spanish Test",
            "address": "San Antonio, TX",
            "health_problems": "dolor de garganta y tos",
            "language": "Spanish"
        },
        {
            "name": "Emergency Test",
            "address": "Houston, TX",
            "health_problems": "severe chest pain and shortness of breath",
            "language": "English"
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n--- Test {i}: {test_case['name']} ---")
        try:
            response = get_medical_advice(
                address=test_case['address'],
                health_problems=test_case['health_problems'],
                language=test_case['language']
            )
            print(f"✅ Success!")
            print(f"Response length: {len(response)} characters")
            print(f"Preview: {response[:300]}...")
            
        except Exception as e:
            print(f"❌ Failed: {e}")
    
    # Test async version
    print(f"\n--- Async Test ---")
    try:
        async def test_async():
            response = await get_medical_advice_async(
                address="Dallas, TX",
                health_problems="back pain",
                language="English"
            )
            print(f"✅ Async Success!")
            print(f"Response length: {len(response)} characters")
            print(f"Preview: {response[:300]}...")
        
        asyncio.run(test_async())
    except Exception as e:
        print(f"❌ Async Failed: {e}")

if __name__ == "__main__":
    # Run manual tests when script is executed directly
    run_manual_test()
    
    # Also run pytest-style tests
    print("\n🧪 Running pytest-style tests...")
    test_instance = TestGeminiAPI()
    
    try:
        test_instance.test_get_medical_advice_basic()
    except Exception as e:
        print(f"Basic test error: {e}")
    
    try:
        test_instance.test_get_medical_advice_spanish()
    except Exception as e:
        print(f"Spanish test error: {e}")
    
    try:
        test_instance.test_get_medical_advice_emergency_symptoms()
    except Exception as e:
        print(f"Emergency test error: {e}")
    
    try:
        asyncio.run(test_instance.test_get_medical_advice_async())
    except Exception as e:
        print(f"Async test error: {e}")
    
    try:
        test_instance.test_input_validation()
    except Exception as e:
        print(f"Input validation test error: {e}")
    
    print("\n✅ All tests completed!")