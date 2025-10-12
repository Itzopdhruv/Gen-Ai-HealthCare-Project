#!/usr/bin/env python3
"""
Test script to check if Groq client is working properly
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('config.env')

def test_groq_client():
    """Test Groq client initialization and API call"""
    
    print("🔍 Testing Groq Client...")
    print("=" * 50)
    
    # Check API key
    groq_api_key = os.getenv('GROQ_API_KEY')
    print(f"📋 GROQ_API_KEY: {groq_api_key[:10]}...{groq_api_key[-5:] if groq_api_key else 'NOT FOUND'}")
    
    if not groq_api_key:
        print("❌ GROQ_API_KEY not found!")
        return False
    
    # Test Groq import
    try:
        from groq import Groq
        print("✅ Groq import successful")
    except ImportError as e:
        print(f"❌ Groq import failed: {e}")
        print("💡 Try: pip install groq")
        return False
    
    # Test Groq client initialization
    try:
        groq_client = Groq(api_key=groq_api_key)
        print("✅ Groq client initialized successfully")
    except Exception as e:
        print(f"❌ Groq client initialization failed: {e}")
        return False
    
    # Test API call
    try:
        print("🤖 Testing API call...")
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "user", "content": "Hello, are you working?"}
            ],
            temperature=0.1,
            max_tokens=50
        )
        
        ai_response = response.choices[0].message.content
        print(f"✅ API call successful!")
        print(f"🤖 Response: {ai_response}")
        return True
        
    except Exception as e:
        print(f"❌ API call failed: {e}")
        print(f"❌ Error type: {type(e)}")
        return False

if __name__ == "__main__":
    success = test_groq_client()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 Groq client is working perfectly!")
        print("💡 The issue might be in the main.py server startup")
    else:
        print("❌ Groq client has issues!")
        print("💡 Fix the Groq setup before running the server")
