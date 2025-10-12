#!/usr/bin/env python3
"""
Test script to verify AI Therapist setup
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('config.env')

def test_imports():
    """Test all required imports"""
    print("🧪 Testing imports...")
    
    try:
        import cv2
        print("✅ cv2 imported successfully")
    except ImportError as e:
        print(f"❌ cv2 import failed: {e}")
        return False
    
    try:
        from groq import Groq
        print("✅ groq imported successfully")
    except ImportError as e:
        print(f"❌ groq import failed: {e}")
        return False
    
    try:
        import fastapi
        print("✅ fastapi imported successfully")
    except ImportError as e:
        print(f"❌ fastapi import failed: {e}")
        return False
    
    try:
        import uvicorn
        print("✅ uvicorn imported successfully")
    except ImportError as e:
        print(f"❌ uvicorn import failed: {e}")
        return False
    
    return True

def test_config():
    """Test configuration"""
    print("\n🔧 Testing configuration...")
    
    groq_key = os.getenv('GROQ_API_KEY')
    if groq_key:
        print(f"✅ GROQ_API_KEY found: {groq_key[:10]}...")
    else:
        print("❌ GROQ_API_KEY not found")
        return False
    
    port = os.getenv('PORT', '8001')
    print(f"✅ PORT: {port}")
    
    host = os.getenv('HOST', '0.0.0.0')
    print(f"✅ HOST: {host}")
    
    return True

def test_groq_client():
    """Test Groq client initialization"""
    print("\n🤖 Testing Groq client...")
    
    try:
        from groq import Groq
        groq_api_key = os.getenv('GROQ_API_KEY')
        
        if not groq_api_key:
            print("❌ GROQ_API_KEY not found")
            return False
        
        client = Groq(api_key=groq_api_key)
        print("✅ Groq client initialized successfully")
        
        # Test a simple API call
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": "Hello, this is a test."}],
            max_tokens=10
        )
        
        print(f"✅ Groq API test successful: {response.choices[0].message.content[:50]}...")
        return True
        
    except Exception as e:
        print(f"❌ Groq client test failed: {e}")
        return False

def test_opencv():
    """Test OpenCV functionality"""
    print("\n📷 Testing OpenCV...")
    
    try:
        import cv2
        import numpy as np
        
        # Test face cascade loading
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        if face_cascade.empty():
            print("❌ Face cascade not loaded")
            return False
        
        print("✅ Face cascade loaded successfully")
        
        # Test basic image operations
        test_image = np.zeros((100, 100, 3), dtype=np.uint8)
        gray = cv2.cvtColor(test_image, cv2.COLOR_BGR2GRAY)
        
        if gray.shape == (100, 100):
            print("✅ Basic OpenCV operations working")
            return True
        else:
            print("❌ OpenCV operations failed")
            return False
            
    except Exception as e:
        print(f"❌ OpenCV test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 AI Therapist Setup Test")
    print("=" * 50)
    
    tests = [
        test_imports,
        test_config,
        test_groq_client,
        test_opencv
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 50)
    print(f"📊 Test Results: {passed}/{total} passed")
    
    if passed == total:
        print("🎉 All tests passed! AI Therapist is ready to run!")
        print("\n🚀 To start the AI Therapist:")
        print("   python main_simple.py")
        print("\n🌐 It will be available at: http://localhost:8001")
        print("📚 API docs at: http://localhost:8001/docs")
    else:
        print("❌ Some tests failed. Please fix the issues above.")
    
    return passed == total

if __name__ == "__main__":
    main()
